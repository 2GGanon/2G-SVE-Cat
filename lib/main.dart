import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
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
  late final Future<List<ScannerCardRecord>> _scannerCatalogueFuture;
  bool _isLoading = true;

  Future<Directory> _resolveCatalogueDir() async {
    if (Platform.isAndroid) {
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

  Future<void> _adjustCardQuantity(String code, int delta) async {
    final payload = jsonEncode({'code': code, 'delta': delta});
    await _controller.runJavaScript(
      'if (window.__sveNativeAdjustCardQuantity) { window.__sveNativeAdjustCardQuantity(${jsonEncode(payload)}); }',
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

  Future<List<ScannerCardRecord>> _loadScannerCatalogue() async {
    final csvText = await rootBundle.loadString('assets/www/data/shadowverse-evolve-card-catalog.csv');
    final rows = parseCsv(csvText);
    return rows.map(ScannerCardRecord.fromCsvRow).toList();
  }

  Future<void> _handleScanCard() async {
    try {
      final cards = await _scannerCatalogueFuture;
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => NativeCardScannerPage(
            cards: cards,
            onAdjustQuantity: _adjustCardQuantity,
          ),
          fullscreenDialog: true,
        ),
      );
      await _sendJsCallback('__sveNativeScanSessionClosed', {'ok': true});
    } catch (e) {
      await _sendJsCallback(
        '__sveNativeScanResult',
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
      } else if (type == 'scan_card') {
        await _handleScanCard();
      } else if (type == 'haptic_feedback') {
        await HapticFeedback.selectionClick();
      }
    } catch (_) {
      // Ignore malformed messages.
    }
  }

  @override
  void initState() {
    super.initState();
    _scannerCatalogueFuture = _loadScannerCatalogue();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'SVEBridge',
        onMessageReceived: _onBridgeMessage,
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            if (mounted) {
              setState(() => _isLoading = false);
            }
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

class NativeCardScannerPage extends StatefulWidget {
  const NativeCardScannerPage({
    super.key,
    required this.cards,
    required this.onAdjustQuantity,
  });

  final List<ScannerCardRecord> cards;
  final Future<void> Function(String code, int delta) onAdjustQuantity;

  @override
  State<NativeCardScannerPage> createState() => _NativeCardScannerPageState();
}

class _NativeCardScannerPageState extends State<NativeCardScannerPage> {
  CameraController? _cameraController;
  late final TextRecognizer _textRecognizer;
  late final ScannerMatcher _matcher;
  bool _isInitializing = true;
  bool _isProcessingFrame = false;
  bool _isDisposed = false;
  DateTime _lastAnalysisAt = DateTime.fromMillisecondsSinceEpoch(0);
  ScannerCardRecord? _stableMatch;
  String _statusText = 'Point the camera at a card code or card name.';
  String _pendingCode = '';
  int _pendingHits = 0;
  int _noMatchFrames = 0;

  @override
  void initState() {
    super.initState();
    _textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);
    _matcher = ScannerMatcher(widget.cards);
    unawaited(_initializeCamera());
  }

  Future<void> _initializeCamera() async {
    try {
      final cameras = await availableCameras();
      final camera = cameras.firstWhere(
        (description) => description.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );

      final controller = CameraController(
        camera,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.nv21,
      );

      await controller.initialize();
      await controller.startImageStream(_processCameraImage);
      if (!mounted) {
        await controller.dispose();
        return;
      }
      setState(() {
        _cameraController = controller;
        _isInitializing = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _statusText = 'Camera failed to start: $e';
        _isInitializing = false;
      });
    }
  }

  Future<void> _processCameraImage(CameraImage image) async {
    if (_isDisposed || _isProcessingFrame) return;
    final controller = _cameraController;
    if (controller == null || !controller.value.isInitialized) return;

    final now = DateTime.now();
    if (now.difference(_lastAnalysisAt) < const Duration(milliseconds: 450)) {
      return;
    }
    _lastAnalysisAt = now;
    _isProcessingFrame = true;

    try {
      if (image.planes.isEmpty) return;
      final plane = image.planes.first;
      final rotation =
          InputImageRotationValue.fromRawValue(controller.description.sensorOrientation) ??
              InputImageRotation.rotation0deg;
      final format = InputImageFormatValue.fromRawValue(image.format.raw) ??
          InputImageFormat.nv21;

      final inputImage = InputImage.fromBytes(
        bytes: plane.bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: rotation,
          format: format,
          bytesPerRow: plane.bytesPerRow,
        ),
      );

      final recognized = await _textRecognizer.processImage(inputImage);
      final match = _matcher.findBestScanMatch(recognized.text);
      if (!mounted || _isDisposed) return;

      setState(() {
        if (match == null) {
          _pendingCode = '';
          _pendingHits = 0;
          _noMatchFrames += 1;
          if (_noMatchFrames >= 5) {
            _stableMatch = null;
          }
          _statusText = 'Searching for a readable card...';
          return;
        }

        _noMatchFrames = 0;
        if (_pendingCode == match.card.code) {
          _pendingHits += 1;
        } else {
          _pendingCode = match.card.code;
          _pendingHits = 1;
        }

        _statusText = 'Detected by ${match.matchedBy}: ${match.card.code}';
        if (_pendingHits >= 2 || match.score >= 240) {
          _stableMatch = match.card;
        }
      });
    } catch (_) {
      // Ignore intermittent frame analysis failures.
    } finally {
      _isProcessingFrame = false;
    }
  }

  Future<void> _adjustQuantity(int delta) async {
    final card = _stableMatch;
    if (card == null) return;
    await widget.onAdjustQuantity(card.code, delta);
    await HapticFeedback.selectionClick();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '${delta > 0 ? 'Added' : 'Removed'} 1 copy: ${card.code}',
        ),
        duration: const Duration(milliseconds: 900),
      ),
    );
  }

  @override
  void dispose() {
    _isDisposed = true;
    final controller = _cameraController;
    if (controller != null) {
      unawaited(controller.stopImageStream().catchError((_) {}));
      unawaited(controller.dispose());
    }
    _textRecognizer.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _cameraController;
    final card = _stableMatch;

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: controller != null && controller.value.isInitialized
                  ? CameraPreview(controller)
                  : Container(
                      color: Colors.black,
                      alignment: Alignment.center,
                      child: _isInitializing
                          ? const CircularProgressIndicator()
                          : Padding(
                              padding: const EdgeInsets.all(24),
                              child: Text(
                                _statusText,
                                style: const TextStyle(color: Colors.white),
                                textAlign: TextAlign.center,
                              ),
                            ),
                    ),
            ),
            Positioned(
              top: 12,
              right: 12,
              child: FilledButton.tonal(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Close'),
              ),
            ),
            Positioned(
              top: 16,
              left: 16,
              right: 100,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.58),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  _statusText,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF10192D).withValues(alpha: 0.94),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF3A5EAC)),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black54,
                      blurRadius: 16,
                      offset: Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    _ScannerThumbnail(card: card),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            card?.name ?? 'No stable match yet',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            card?.code ?? 'Keep the card steady in frame',
                            style: const TextStyle(
                              color: Color(0xFFC7D8FF),
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: card == null ? null : () => _adjustQuantity(-1),
                                  child: const Text('-'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: FilledButton(
                                  onPressed: card == null ? null : () => _adjustQuantity(1),
                                  child: const Text('+'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScannerThumbnail extends StatelessWidget {
  const _ScannerThumbnail({required this.card});

  final ScannerCardRecord? card;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 92,
      height: 128,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: const Color(0xFF172338),
        border: Border.all(color: const Color(0xFF30528E)),
      ),
      clipBehavior: Clip.antiAlias,
      child: card == null
          ? const Center(
              child: Icon(Icons.image_search, color: Color(0xFFB5C8F4), size: 34),
            )
          : Image.asset(
              card!.artAssetCandidates.first,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const Center(
                child: Icon(Icons.photo, color: Color(0xFFB5C8F4), size: 34),
              ),
            ),
    );
  }
}

class ScannerCardRecord {
  const ScannerCardRecord({
    required this.name,
    required this.code,
    required this.setCode,
    required this.artAssetCandidates,
    required this.normalizedName,
    required this.nameTokens,
    required this.rarityHint,
  });

  final String name;
  final String code;
  final String setCode;
  final List<String> artAssetCandidates;
  final String normalizedName;
  final List<String> nameTokens;
  final String rarityHint;

  factory ScannerCardRecord.fromCsvRow(Map<String, String> row) {
    final code = (row['Card Code'] ?? '').trim();
    final name = (row['Card Name'] ?? '').trim();
    final setCode = setCodeFromCardCode(code);
    final artUrl = (row['Art URL'] ?? '').trim();
    final normalizedCode = normalizeCardCode(code);
    final candidates = <String>{
      if (artUrl.isNotEmpty) ..._artCandidatesFromUrl(setCode, artUrl),
      'assets/www/assets/cards/$setCode/$normalizedCode.png',
      'assets/www/assets/cards/$setCode/$normalizedCode.jpg',
      'assets/www/assets/cards/$setCode/$normalizedCode.jpeg',
      'assets/www/assets/cards/$setCode/$normalizedCode.webp',
      'assets/www/assets/cards/$setCode/$normalizedCode.avif',
    }.toList();

    return ScannerCardRecord(
      name: name,
      code: code,
      setCode: setCode,
      artAssetCandidates: candidates,
      normalizedName: normalizeScanText(name),
      nameTokens: tokenizeNameForScan(name),
      rarityHint: rarityHintFromCardCode(code),
    );
  }

  static List<String> _artCandidatesFromUrl(String setCode, String artUrl) {
    final uri = Uri.tryParse(artUrl);
    final fileName = uri?.pathSegments.isNotEmpty == true
        ? uri!.pathSegments.last
        : artUrl.split('/').last;
    if (fileName.isEmpty) return const [];
    return ['assets/www/assets/cards/$setCode/$fileName'];
  }
}

class ScannerMatch {
  const ScannerMatch({
    required this.card,
    required this.matchedBy,
    required this.score,
  });

  final ScannerCardRecord card;
  final String matchedBy;
  final int score;
}

class ScannerMatcher {
  ScannerMatcher(this.cards) {
    _buildIndexes();
  }

  final List<ScannerCardRecord> cards;
  final Map<String, List<ScannerCardRecord>> _codeAliasMap = {};
  final Map<String, List<ScannerCardRecord>> _nameAliasMap = {};
  final Map<String, List<ScannerCardRecord>> _nameTokenMap = {};

  void _buildIndexes() {
    for (final card in cards) {
      for (final alias in codeScanAliases(card.code)) {
        _codeAliasMap.putIfAbsent(alias, () => <ScannerCardRecord>[]).add(card);
      }
      final nameAlias = card.normalizedName;
      if (nameAlias.length >= 6) {
        _nameAliasMap.putIfAbsent(nameAlias, () => <ScannerCardRecord>[]).add(card);
      }
      for (final token in card.nameTokens) {
        _nameTokenMap.putIfAbsent(token, () => <ScannerCardRecord>[]).add(card);
      }
    }
  }

  ScannerMatch? findBestScanMatch(String recognizedText) {
    final compact = normalizeScanText(recognizedText);
    if (compact.isEmpty) {
      return null;
    }

    final scored = <String, _ScoredMatcherCandidate>{};

    void addCandidate(
      ScannerCardRecord card,
      int score,
      String reason,
    ) {
      final existing = scored[card.code];
      if (existing == null) {
        scored[card.code] = _ScoredMatcherCandidate(
          card: card,
          score: score,
          reasons: {reason},
        );
        return;
      }
      existing.score += score;
      existing.reasons.add(reason);
    }

    final fullNameMatches = _findFullNameMatches(compact);
    for (final match in fullNameMatches) {
      addCandidate(match.card, match.score, 'name');
    }

    final tokenMatches = _findNameTokenMatches(recognizedText);
    for (final match in tokenMatches) {
      addCandidate(match.card, match.score, 'name token');
    }

    final codeMatches = _findCardByCodeCandidates(recognizedText);
    for (final match in codeMatches) {
      addCandidate(match.card, match.score, match.matchedBy);
    }

    if (scored.isEmpty) {
      return null;
    }

    for (final candidate in scored.values) {
      final rarityHint = candidate.card.rarityHint;
      if (rarityHint.isNotEmpty && compact.contains(rarityHint)) {
        candidate.score += 18;
        candidate.reasons.add('rarity');
      }
    }

    final ranked = scored.values.toList()
      ..sort((a, b) {
        final score = b.score.compareTo(a.score);
        if (score != 0) return score;
        final reasons = b.reasons.length.compareTo(a.reasons.length);
        if (reasons != 0) return reasons;
        return a.card.code.compareTo(b.card.code);
      });

    final best = ranked.first;
    final secondScore = ranked.length > 1 ? ranked[1].score : -999;
    final margin = best.score - secondScore;
    if (best.score < 45) {
      return null;
    }
    if (ranked.length > 1 && margin < 12) {
      return null;
    }

    final matchedBy = best.reasons.contains('name')
        ? 'name'
        : best.reasons.contains('name token')
            ? 'name'
            : best.reasons.first;
    return ScannerMatch(card: best.card, matchedBy: matchedBy, score: best.score);
  }

  List<ScannerMatch> _findCardByCodeCandidates(String recognizedText) {
    final candidates = extractScanCodeCandidates(recognizedText);
    final directHits = <String, ScannerMatch>{};

    for (final candidate in candidates) {
      final exact = _codeAliasMap[candidate];
      if (exact != null && exact.length == 1) {
        directHits[exact.first.code] = ScannerMatch(
          card: exact.first,
          matchedBy: 'code',
          score: 120 + candidate.length,
        );
      }
    }

    if (directHits.isNotEmpty) {
      return directHits.values.toList();
    }

    final fuzzyHits = <ScannerMatch>[];
    for (final candidate in candidates) {
      _codeAliasMap.forEach((alias, aliasCards) {
        if (aliasCards.length != 1) return;
        final limit = candidate.length >= 10 ? 2 : 1;
        final distance = editDistanceWithinLimit(candidate, alias, limit);
        if (distance <= limit) {
          fuzzyHits.add(
            ScannerMatch(
              card: aliasCards.first,
              matchedBy: distance == 0 ? 'code' : 'code (OCR corrected)',
              score: 70 + alias.length - distance * 6,
            ),
          );
        }
      });
    }

    return fuzzyHits;
  }

  List<ScannerMatch> _findFullNameMatches(String compact) {
    final exactHits = <ScannerMatch>[];
    _nameAliasMap.forEach((alias, aliasCards) {
      if (!compact.contains(alias)) return;
      for (final card in aliasCards) {
        exactHits.add(
          ScannerMatch(
            card: card,
            matchedBy: 'name',
            score: 180 + alias.length * 2,
          ),
        );
      }
    });
    return exactHits;
  }

  List<ScannerMatch> _findNameTokenMatches(String recognizedText) {
    final tokens = tokenizeNameForScan(recognizedText);
    if (tokens.isEmpty) {
      return const [];
    }

    final scores = <String, _ScoredMatcherCandidate>{};
    for (final token in tokens) {
      final cardsForToken = _nameTokenMap[token];
      if (cardsForToken == null) continue;
      final tokenScore = token.length * 12;
      for (final card in cardsForToken) {
        final existing = scores[card.code];
        if (existing == null) {
          scores[card.code] = _ScoredMatcherCandidate(
            card: card,
            score: tokenScore,
            reasons: {'name token'},
          );
        } else {
          existing.score += tokenScore;
          existing.reasons.add('name token');
        }
      }
    }

    return scores.values
        .where((entry) => entry.score >= 48)
        .map(
          (entry) => ScannerMatch(
            card: entry.card,
            matchedBy: 'name token',
            score: entry.score,
          ),
        )
        .toList();
  }
}

class _ScoredMatcherCandidate {
  _ScoredMatcherCandidate({
    required this.card,
    required this.score,
    required this.reasons,
  });

  final ScannerCardRecord card;
  int score;
  final Set<String> reasons;
}

String normalizeCardCode(String rawCode) {
  var code = rawCode.trim();
  try {
    code = Uri.decodeComponent(code);
  } catch (_) {
    // Keep original if decoding fails.
  }
  return code.replaceAll(RegExp(r'-LD[\u24C8S](\d+EN)$', caseSensitive: false), '-LD\$1');
}

String setCodeFromCardCode(String cardCode) {
  final normalized = normalizeCardCode(cardCode);
  final match = RegExp(r'^([A-Za-z0-9]+)-').firstMatch(normalized);
  return match?.group(1) ?? 'UNKNOWN';
}

String normalizeScanText(String value) {
  final normalized = value
      .toUpperCase()
      .replaceAll(RegExp(r'[^A-Z0-9]'), '');
  return normalized;
}

List<String> tokenizeNameForScan(String value) {
  const stopWords = {
    'THE',
    'AND',
    'FOR',
    'OF',
    'TO',
    'A',
    'AN',
    'IN',
    'ON',
    'MY',
    'YOUR',
  };

  return value
      .toUpperCase()
      .split(RegExp(r'[^A-Z0-9]+'))
      .map((token) => token.trim())
      .where((token) => token.length >= 4 && !stopWords.contains(token))
      .toSet()
      .toList();
}

String rarityHintFromCardCode(String cardCode) {
  final normalized = normalizeCardCode(cardCode).toUpperCase();
  final suffix = normalized.contains('-') ? normalized.split('-').last : normalized;
  final prefixMatch = RegExp(r'^(SSP|SL|SP|PR|P|U|LD|T|EP)').firstMatch(suffix);
  if (prefixMatch != null) {
    return prefixMatch.group(1) ?? '';
  }
  return '';
}

Set<String> codeScanAliases(String code) {
  final normalized = normalizeCardCode(code).toUpperCase();
  final aliases = <String>{};

  void push(String value) {
    final compact = normalizeScanText(value);
    if (compact.length >= 5) {
      aliases.add(compact);
    }
  }

  push(normalized);
  push(normalized.replaceAll(RegExp(r'_URA', caseSensitive: false), ''));
  push(normalized.replaceAll(RegExp(r'EN$', caseSensitive: false), ''));
  push(
    normalized
        .replaceAll(RegExp(r'_URA', caseSensitive: false), '')
        .replaceAll(RegExp(r'EN$', caseSensitive: false), ''),
  );

  return aliases;
}

String applyOcrCodeCorrections(String value) {
  var corrected = value.toUpperCase();
  if (!RegExp(r'\d').hasMatch(corrected)) {
    return corrected;
  }
  corrected = corrected
      .replaceAll(RegExp(r'[OQD]'), '0')
      .replaceAll(RegExp(r'[IL]'), '1')
      .replaceAll('Z', '2')
      .replaceAll('S', '5');
  return corrected;
}

bool looksLikeCardCodeCandidate(String value) {
  return RegExp(r'^[A-Z]{2,6}\d{1,3}[A-Z]?\d*[A-Z0-9]*$').hasMatch(value) ||
      RegExp(r'^[A-Z]{2,6}\d{1,3}$').hasMatch(value);
}

List<String> extractScanCodeCandidates(String recognizedText) {
  final source = recognizedText
      .toUpperCase()
      .replaceAll('\u2014', '-')
      .replaceAll('\u2013', '-')
      .replaceAll('\u2212', '-');

  final candidates = <String>{};

  void push(String value) {
    final compact = normalizeScanText(value);
    if (compact.length >= 5) {
      candidates.add(compact);
    }
  }

  push(source);

  final rawTokens = source
      .split(RegExp(r'[^A-Z0-9]+'))
      .map((token) => token.trim())
      .where((token) => token.isNotEmpty)
      .toList();

  for (final token in rawTokens) {
    push(token);
    push(applyOcrCodeCorrections(token));
  }

  for (var i = 0; i < rawTokens.length; i++) {
    for (var span = 2; span <= 4 && i + span <= rawTokens.length; span++) {
      final joined = rawTokens.sublist(i, i + span).join();
      push(joined);
      push(applyOcrCodeCorrections(joined));
    }
  }

  final regex = RegExp(
    r'\b([A-Z]{2,6}[0OILSQDZ]{1,3}[A-Z]?(?:[- ]?[A-Z]{0,4}[0-9OILSQDZ]{1,4})?(?:[-_ ]?URA)?(?:[-_ ]?EN)?)\b',
  );
  for (final match in regex.allMatches(source)) {
    final candidate = match.group(1);
    if (candidate == null) continue;
    push(candidate);
    push(applyOcrCodeCorrections(candidate));
  }

  return candidates.where(looksLikeCardCodeCandidate).toList();
}

int editDistanceWithinLimit(String a, String b, int limit) {
  if (a == b) return 0;
  if (a.isEmpty || b.isEmpty) {
    return a.length > b.length ? a.length : b.length;
  }
  if ((a.length - b.length).abs() > limit) {
    return limit + 1;
  }

  var previous = List<int>.generate(b.length + 1, (index) => index);
  var current = List<int>.filled(b.length + 1, 0);

  for (var i = 1; i <= a.length; i++) {
    current[0] = i;
    var rowMin = current[0];
    for (var j = 1; j <= b.length; j++) {
      final cost = a[i - 1] == b[j - 1] ? 0 : 1;
      current[j] = [
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      ].reduce((left, right) => left < right ? left : right);
      if (current[j] < rowMin) {
        rowMin = current[j];
      }
    }
    if (rowMin > limit) {
      return limit + 1;
    }
    previous = List<int>.from(current);
  }

  return previous.last;
}

List<Map<String, String>> parseCsv(String text) {
  final rows = <List<String>>[];
  final row = <String>[];
  var cell = '';
  var inQuotes = false;

  for (var i = 0; i < text.length; i++) {
    final ch = text[i];
    final next = i + 1 < text.length ? text[i + 1] : '';

    if (ch == '"') {
      if (inQuotes && next == '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch == ',' && !inQuotes) {
      row.add(cell);
      cell = '';
    } else if ((ch == '\n' || ch == '\r') && !inQuotes) {
      if (ch == '\r' && next == '\n') {
        i++;
      }
      row.add(cell);
      rows.add(List<String>.from(row));
      row.clear();
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.isNotEmpty || row.isNotEmpty) {
    row.add(cell);
    rows.add(List<String>.from(row));
  }

  if (rows.isEmpty) return const [];
  final headers = rows.first.map((entry) => entry.trim()).toList();
  final data = <Map<String, String>>[];
  for (var i = 1; i < rows.length; i++) {
    final values = rows[i];
    final map = <String, String>{};
    for (var j = 0; j < headers.length; j++) {
      map[headers[j]] = j < values.length ? values[j].trim() : '';
    }
    data.add(map);
  }
  return data;
}
