func dateFromString(_ dateString: String) -> Date? {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd"
    return dateFormatter.date(from: dateString)
}

func stringFromDate(_ date: Date?) -> String {
    guard let date = date else { return "" }
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-ddTHH:mm:ss"
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
