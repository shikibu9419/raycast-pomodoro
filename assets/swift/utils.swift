let dateFormatter = ISO8601DateFormatter()
dateFormatter.timeZone = TimeZone(identifier: "Asia/Tokyo")!

func dateFromString(_ dateString: String) -> Date? {
    return dateFormatter.date(from: dateString)
}

func stringFromDate(_ date: Date?) -> String {
    guard let date = date else { return "" }
    return dateFormatter.string(from: date)
}

// JSONデータをprint
func printData(_ data: String) {
      print("{\"data\": \(data)}")
}

// OKをprint
func printOk() {
      print("{}")
}

// error messageをprint
func printError(_ message: String) {
      print("{\"error\": \"\(message)\"}")
}
