package com.example.wordtopdf.presentation

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.collectAsState
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.wordtopdf.data.DocxToPdfConverterImpl
import com.example.wordtopdf.domain.ConvertDocxToPdfUseCase
import com.example.wordtopdf.presentation.convert.ConvertScreen
import com.example.wordtopdf.presentation.home.HomeScreen
import com.example.wordtopdf.presentation.result.ResultScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val vmFactory = SimpleViewModelFactory {
            MainViewModel(ConvertDocxToPdfUseCase(DocxToPdfConverterImpl(applicationContext)))
        }

        setContent {
            val vm: MainViewModel = viewModel(factory = vmFactory)
            val state = vm.uiState.collectAsState().value

            val pickWordFileLauncher = rememberLauncherForActivityResult(
                contract = ActivityResultContracts.OpenDocument(),
                onResult = { uri: Uri? ->
                    uri ?: return@rememberLauncherForActivityResult
                    contentResolver.takePersistableUriPermission(
                        uri,
                        android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
                    )
                    val fileName = uri.lastPathSegment?.substringAfterLast('/') ?: "secilen.docx"
                    vm.onFileSelected(uri.toString(), fileName)
                }
            )

            val pickSaveFolderLauncher = rememberLauncherForActivityResult(
                contract = ActivityResultContracts.OpenDocumentTree(),
                onResult = { uri: Uri? ->
                    uri ?: return@rememberLauncherForActivityResult
                    contentResolver.takePersistableUriPermission(
                        uri,
                        android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION or
                            android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                    )
                    vm.onSaveLocationSelected(uri.toString())
                }
            )

            when {
                state.isConverting -> ConvertScreen()
                state.outputPath.isNotBlank() -> ResultScreen(
                    outputPath = state.outputPath,
                    onReset = vm::reset
                )

                else -> HomeScreen(
                    state = state,
                    onSelectPhoneSource = { vm.onSourceSelected("Telefon Depolama") },
                    onSelectDriveSource = { vm.onSourceSelected("Google Drive") },
                    onPickWordFile = {
                        pickWordFileLauncher.launch(
                            arrayOf(
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                "application/msword"
                            )
                        )
                    },
                    onPickSaveDirectory = { pickSaveFolderLauncher.launch(null) },
                    onConvertClick = vm::startConversion
                )
            }
        }
    }
}
