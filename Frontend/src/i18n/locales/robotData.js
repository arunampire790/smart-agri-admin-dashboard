// Robot Data entry page - the stand-in for the robot's radio.
export default {
  en: {
    title: 'Robot Data',
    subtitle: 'Send a sensor reading the way the robot will once it is built',
    previewNote:
      'Temporary. This posts to the same endpoint the real robot will use, so nothing here changes when the hardware ships - only who calls it.',

    selectRobot: 'Select a robot',
    noRobots: 'No robots yet. Generate one under Robot Assignment.',
    onFarm: 'On {farm}',
    noFarmWarning:
      'This robot is not connected to a farm, so its readings will not reach any advisory. Connect it with its QR sticker first.',

    presets: 'Start from a situation',
    presetHint: 'Fills the form below - edit any value before sending.',
    presetHealthy: 'Everything in range',
    presetDry: 'Drying out',
    presetWet: 'Waterlogged',
    presetHungry: 'Nutrient-starved',
    presetMuggy: 'Warm and humid',

    readingTitle: 'Reading',
    battery: 'Battery',
    soilMoisture: 'Soil moisture',
    soilTemperature: 'Soil temperature',
    temperature: 'Air temperature',
    humidity: 'Humidity',
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    lightIntensity: 'Light',
    windSpeed: 'Wind speed',
    rainfall: 'Rainfall',

    replaceHistory: 'Replace this robot\'s previous readings',
    replaceHistoryHint:
      'The advisory averages the last 24 hours, so without this each reading is blended with the ones before it and the advice stops matching what you typed.',

    send: 'Send reading',
    sending: 'Sending...',
    sent: 'Reading recorded.',
    viewAdvisory: 'Open full advisory',
    clearHistory: 'Clear {n} reading(s)',

    resultTitle: 'What this reading advises',
    resultNone: 'Everything in range - no action needed.',
    score: 'score',
    sev: 'sev',
    urg: 'urg',
    imp: 'imp',
    averagedWarning:
      'This is the average of {n} readings from the last 24 hours, not the one you just sent. Tick "Replace previous readings" to test one reading at a time.',

    recent: 'Recent readings',
    noReadings: 'No readings from this robot yet.',
    colTime: 'Recorded',
    colMoisture: 'Moisture',
    colTemp: 'Air / soil',
    colNpk: 'N / P / K',

    errRequired: 'Every field needs a number.',
    errRobot: 'Pick a robot first.',
  },

  ja: {
    title: 'ロボットデータ',
    subtitle: '完成後のロボットと同じ方法でセンサー値を送信します',
    previewNote:
      '一時的なページです。実機と同じエンドポイントに送信するため、ハードウェア完成後も変更は不要です。',

    selectRobot: 'ロボットを選択',
    noRobots: 'ロボットがありません。「ロボット割り当て」から生成してください。',
    onFarm: '農場: {farm}',
    noFarmWarning:
      'このロボットは農場に接続されていないため、測定値はアドバイザリーに届きません。まずQRコードで接続してください。',

    presets: '状況から始める',
    presetHint: '下のフォームに入力されます。送信前に自由に編集できます。',
    presetHealthy: 'すべて適正',
    presetDry: '乾燥している',
    presetWet: '過湿',
    presetHungry: '養分不足',
    presetMuggy: '高温多湿',

    readingTitle: '測定値',
    battery: 'バッテリー',
    soilMoisture: '土壌水分',
    soilTemperature: '地温',
    temperature: '気温',
    humidity: '湿度',
    nitrogen: '窒素 (N)',
    phosphorus: 'リン (P)',
    potassium: 'カリウム (K)',
    lightIntensity: '光量',
    windSpeed: '風速',
    rainfall: '降水量',

    replaceHistory: 'このロボットの過去の測定値を置き換える',
    replaceHistoryHint:
      'アドバイザリーは過去24時間の平均を使うため、これを外すと入力した値と提案が一致しなくなります。',

    send: '測定値を送信',
    sending: '送信中...',
    sent: '記録しました。',
    viewAdvisory: '詳細な提案を開く',
    clearHistory: '{n}件の測定値を削除',

    resultTitle: 'この測定値からの提案',
    resultNone: 'すべて適正範囲です。作業は不要です。',
    score: 'スコア',
    sev: '深刻度',
    urg: '緊急度',
    imp: '影響',
    averagedWarning:
      'これは過去24時間の{n}件の平均であり、今送った値だけではありません。1件ずつ試すには「過去の測定値を置き換える」を有効にしてください。',

    recent: '最近の測定値',
    noReadings: 'このロボットの測定値はまだありません。',
    colTime: '記録日時',
    colMoisture: '水分',
    colTemp: '気温 / 地温',
    colNpk: 'N / P / K',

    errRequired: 'すべての項目に数値が必要です。',
    errRobot: '先にロボットを選択してください。',
  },
};
