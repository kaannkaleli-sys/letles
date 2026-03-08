package com.example.wordtopdf.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.wordtopdf.domain.ConversionResult
import com.example.wordtopdf.domain.ConvertDocxToPdfUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel(
    private val convertDocxToPdfUseCase: ConvertDocxToPdfUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    fun onSourceSelected(source: String) {
        _uiState.value = _uiState.value.copy(
            selectedSource = source,
            selectedFileUri = "",
            selectedFileName = "",
            errorMessage = null,
            outputPath = ""
        )
    }

    fun onFileFetchedFromSource() {
        val source = _uiState.value.selectedSource
        if (source.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "Önce dosya kaynağını seçin")
            return
        }

        val (uri, name) = when (source) {
            "Telefon Depolama" -> "content://local/storage/ornek.docx" to "ornek.docx"
            "Google Drive" -> "content://drive/ornek.docx" to "drive_ornek.docx"
            else -> "content://unknown/ornek.docx" to "ornek.docx"
        }

        _uiState.value = _uiState.value.copy(
            selectedFileUri = uri,
            selectedFileName = name,
            errorMessage = null,
            outputPath = ""
        )
    }

    fun onSaveLocationSelected(location: String) {
        _uiState.value = _uiState.value.copy(selectedSaveLocation = location, errorMessage = null)
    }

    fun reset() {
        _uiState.value = MainUiState()
    }

    fun startConversion() {
        val current = _uiState.value
        if (current.selectedSource.isBlank()) {
            _uiState.value = current.copy(errorMessage = "Dosya kaynağını seçin")
            return
        }
        if (current.selectedFileUri.isBlank()) {
            _uiState.value = current.copy(errorMessage = "Kaynak seçtikten sonra dosyayı çekin")
            return
        }
        if (current.selectedSaveLocation.isBlank()) {
            _uiState.value = current.copy(errorMessage = "PDF'in nereye kaydedileceğini seçin")
            return
        }

        val outputName = current.selectedFileName.substringBeforeLast('.', "donusturulen") + ".pdf"

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isConverting = true, errorMessage = null)

            when (
                val result = convertDocxToPdfUseCase(
                    current.selectedFileUri,
                    current.selectedSaveLocation,
                    outputName
                )
            ) {
                is ConversionResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isConverting = false,
                        outputPath = result.outputPath
                    )
                }

                is ConversionResult.Failure -> {
                    _uiState.value = _uiState.value.copy(
                        isConverting = false,
                        errorMessage = result.reason
                    )
                }
            }
        }
    }
}
