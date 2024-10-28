import ExpoModulesCore
import UIKit

public class ImagePickerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ImagePicker")

    Function("pickImage") { () -> String in
      return pickImage()
    }
  }

  private func pickImage() -> String {
    var result = ""
    let semaphore = DispatchSemaphore(value: 0)

    DispatchQueue.main.async {
      let picker = UIImagePickerController()
      picker.sourceType = .photoLibrary
      picker.allowsEditing = false
      picker.delegate = ImagePickerDelegate(completion: { imagePath in
        result = imagePath
        semaphore.signal()
      })

      UIApplication.shared.windows.first?.rootViewController?.present(picker, animated: true, completion: nil)
    }

    semaphore.wait()
    return result
  }
}

class ImagePickerDelegate: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
  private let completion: (String) -> Void

  init(completion: @escaping (String) -> Void) {
    self.completion = completion
  }

  func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
    picker.dismiss(animated: true, completion: nil)

    guard let image = info[.originalImage] as? UIImage else {
      completion("")
      return
    }

    let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    let fileName = UUID().uuidString + ".jpg"
    let fileURL = documentsDirectory.appendingPathComponent(fileName)

    if let data = image.jpegData(compressionQuality: 1.0) {
      try? data.write(to: fileURL)
      completion(fileURL.path)
    } else {
      completion("")
    }
  }

  func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    picker.dismiss(animated: true, completion: nil)
    completion("")
  }
}
