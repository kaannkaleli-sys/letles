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

    fun onFileSelected(uri: String, fileName: String) {
        _uiState.value = _uiState.value.copy(
            selectedFileUri = uri,
            selectedFileName = fileName,
            errorMessage = null,
            outputPath = ""
        )
    }

    fun startConversion() {
        val current = _uiState.value
        if (current.selectedFileUri.isBlank()) {
            _uiState.value = current.copy(errorMessage = "Önce dosya seçin")
            return
        }

        val outputName = current.selectedFileName.substringBeforeLast('.', "donusturulen") + ".pdf"

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isConverting = true, errorMessage = null)

            when (val result = convertDocxToPdfUseCase(current.selectedFileUri, outputName)) {
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
