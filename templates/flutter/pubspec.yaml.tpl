name: {{projectName}}_native
description: Flutter native wrapper for {{projectName}}
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.10.0
  flutter_background_service: ^5.0.9

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
