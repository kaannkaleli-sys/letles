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
        _uiState.value = _uiState.value.copy(selectedSource = source, errorMessage = null)
    }

    fun onFileSelected(uri: String, fileName: String) {
        _uiState.value = _uiState.value.copy(
            selectedFileUri = uri,
            selectedFileName = fileName,
            errorMessage = null,
            outputPath = ""
        )
    }

    fun onSaveLocationSelected(locationUri: String) {
        _uiState.value = _uiState.value.copy(selectedSaveLocation = locationUri, errorMessage = null)
    }

    fun reset() {
        _uiState.value = MainUiState()
    }

    fun startConversion() {
        val current = _uiState.value
        if (current.selectedSource.isBlank()) {
            _uiState.value = current.copy(errorMessage = "Önce dosya kaynağını seçin")
            return
        }
        if (current.selectedFileUri.isBlank()) {
            _uiState.value = current.copy(errorMessage = "Word dosyasını seçin")
            return
        }
        if (current.selectedSaveLocation.isBlank()) {
            _uiState.value = current.copy(errorMessage = "PDF kayıt klasörünü seçin")
            return
        }

        val outputName = current.selectedFileName.substringBeforeLast('.', "donusturulen") + ".pdf"

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isConverting = true, errorMessage = null)

            when (
                val result = convertDocxToPdfUseCase(
                    inputUri = current.selectedFileUri,
                    outputDirectory = current.selectedSaveLocation,
                    outputFileName = outputName
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
