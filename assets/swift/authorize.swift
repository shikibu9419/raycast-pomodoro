import EventKit

func requestAccess(entity: EKEntityType, callback: @escaping (EKEventStore) -> Void) {
    let store = EKEventStore()

    switch EKEventStore.authorizationStatus(for: entity) {
    case .authorized:
        callback(store)
    case .denied:
        print("Access to \(entity.rawValue) is denied.")
    case .notDetermined:
        store.requestAccess(to: entity) { (granted, error) in
            if let error = error {
                print("Error in requesting access: \(error)")
                return
            }

            if granted {
                callback(store)
            }
        }
    default:
        print("Unknown authorization status for \(entity.rawValue).")
    }
}

requestAccess(entity: .reminder) { store in
    print("Granted!")
}
