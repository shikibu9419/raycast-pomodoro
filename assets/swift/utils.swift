let dateFormatter = ISO8601DateFormatter()
dateFormatter.timeZone = TimeZone(identifier: "Asia/Tokyo")!

func stringToDate(_ dateString: String) -> Date? {
    return dateFormatter.date(from: dateString)
}

func dateToString(_ date: Date?) -> String {
    guard let date = date else { return "" }
    return dateFormatter.string(from: date)
}

func parseJson(_ jsonString: String) -> [String: Any] {
    let jsonData = jsonString.data(using: .utf8)!
    guard let json = try? JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] else {
        printError("Invalid JSON format.")
        exit(1)
    }

    return json;
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
