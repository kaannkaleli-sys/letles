package com.example.wordtopdf.presentation

data class MainUiState(
    val selectedSource: String = "",
    val selectedFileUri: String = "",
    val selectedFileName: String = "",
    val selectedSaveLocation: String = "",
    val isConverting: Boolean = false,
    val outputPath: String = "",
    val errorMessage: String? = null
)
