package expo.modules.imagepicker

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.util.*

class ImagePickerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ImagePicker")

    Function("pickImage") {
      return@Function pickImage()
    }
  }

  private fun pickImage(): String {
    var result = ""
    val activityProvider = appContext.activityProvider ?: return result

    val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
    val activity = activityProvider.currentActivity as Activity

    activity.startActivityForResult(intent, IMAGE_PICKER_REQUEST_CODE)

    val semaphore = java.util.concurrent.Semaphore(0)

    activityProvider.addActivityResultListener { requestCode, resultCode, data ->
      if (requestCode == IMAGE_PICKER_REQUEST_CODE) {
        if (resultCode == Activity.RESULT_OK && data != null) {
          val selectedImage: Uri? = data.data
          selectedImage?.let {
            result = copyImageToInternalStorage(it)
          }
        }
        semaphore.release()
        true
      } else {
        false
      }
    }

    semaphore.acquire()
    return result
  }

  private fun copyImageToInternalStorage(uri: Uri): String {
    val inputStream = appContext.reactContext?.contentResolver?.openInputStream(uri)
    val fileName = UUID.randomUUID().toString() + ".jpg"
    val file = File(appContext.reactContext?.filesDir, fileName)

    inputStream?.use { input ->
      file.outputStream().use { output ->
        input.copyTo(output)
      }
    }

    return file.absolutePath
  }

  companion object {
    private const val IMAGE_PICKER_REQUEST_CODE = 1001
  }
}
