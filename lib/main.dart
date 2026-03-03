import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SveCatalogueApp());
}

class SveCatalogueApp extends StatelessWidget {
  const SveCatalogueApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SVE Catalogue',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: Colors.teal, useMaterial3: true),
      home: const CatalogueWebViewPage(),
    );
  }
}

class CatalogueWebViewPage extends StatefulWidget {
  const CatalogueWebViewPage({super.key});

  @override
  State<CatalogueWebViewPage> createState() => _CatalogueWebViewPageState();
}

class _CatalogueWebViewPageState extends State<CatalogueWebViewPage> {
  late final WebViewController _controller;
  bool _isLoading = true;

  Future<Directory> _resolveCatalogueDir() async {
    if (Platform.isAndroid) {
      // Prefer internal storage root so files are outside Android/data.
      final rootPreferred = Directory('/storage/emulated/0/SVE Catalogue');
      try {
        if (!await rootPreferred.exists()) {
          await rootPreferred.create(recursive: true);
        }
        return rootPreferred;
      } catch (_) {
        // Fall back when root path is restricted by device policy/scoped storage.
      }

      final androidScoped = await getExternalStorageDirectory();
      if (androidScoped != null) {
        final fallbackDir = Directory('${androidScoped.path}/SVE Catalogue');
        if (!await fallbackDir.exists()) {
          await fallbackDir.create(recursive: true);
        }
        return fallbackDir;
      }
    }
    final base = await getApplicationDocumentsDirectory();
    final dir = Directory('${base.path}/SVE Catalogue');
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  Future<void> _sendJsCallback(String functionName, Map<String, dynamic> payload) async {
    final payloadJson = jsonEncode(payload);
    await _controller.runJavaScript(
      'if (window.$functionName) { window.$functionName(${jsonEncode(payloadJson)}); }',
    );
  }

  Future<void> _handleExport(Map<String, dynamic> message) async {
    try {
      final jsonText = (message['jsonText'] ?? '').toString();
      if (jsonText.isEmpty) {
        await _sendJsCallback(
          '__sveNativeExportResult',
          {'ok': false, 'error': 'Empty export payload.'},
        );
        return;
      }

      final dir = await _resolveCatalogueDir();
      final stamp = DateTime.now()
          .toIso8601String()
          .replaceAll(':', '-')
          .replaceAll('.', '-');
      final file = File('${dir.path}/$stamp.json');
      await file.writeAsString(jsonText, flush: true);

      await _sendJsCallback(
        '__sveNativeExportResult',
        {'ok': true, 'path': file.path},
      );
    } catch (e) {
      await _sendJsCallback(
        '__sveNativeExportResult',
        {'ok': false, 'error': e.toString()},
      );
    }
  }

  Future<void> _handleImportLatest() async {
    try {
      final dir = await _resolveCatalogueDir();
      final entries = await dir
          .list()
          .where((e) => e is File && e.path.toLowerCase().endsWith('.json'))
          .cast<File>()
          .toList();
      if (entries.isEmpty) {
        await _sendJsCallback(
          '__sveNativeImportResult',
          {'ok': false, 'error': 'No export files found in SVE Catalogue folder.'},
        );
        return;
      }

      entries.sort(
        (a, b) => b.lastModifiedSync().compareTo(a.lastModifiedSync()),
      );
      final latest = entries.first;
      final text = await latest.readAsString();
      await _sendJsCallback(
        '__sveNativeImportResult',
        {'ok': true, 'jsonText': text, 'path': latest.path},
      );
    } catch (e) {
      await _sendJsCallback(
        '__sveNativeImportResult',
        {'ok': false, 'error': e.toString()},
      );
    }
  }

  Future<void> _onBridgeMessage(JavaScriptMessage message) async {
    try {
      final parsed = jsonDecode(message.message);
      if (parsed is! Map<String, dynamic>) return;
      final type = (parsed['type'] ?? '').toString();
      if (type == 'export_collection') {
        await _handleExport(parsed);
      } else if (type == 'import_latest') {
        await _handleImportLatest();
      }
    } catch (_) {
      // Ignore malformed messages.
    }
  }

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'SVEBridge',
        onMessageReceived: _onBridgeMessage,
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            if (mounted) setState(() => _isLoading = false);
          },
        ),
      )
      ..loadFlutterAsset('assets/www/index.html');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(),
              ),
          ],
        ),
      ),
    );
  }
}
