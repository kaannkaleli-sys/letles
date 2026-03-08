package com.example.wordtopdf.presentation

data class MainUiState(
    val selectedFileUri: String = "",
    val selectedFileName: String = "",
    val isConverting: Boolean = false,
    val outputPath: String = "",
    val errorMessage: String? = null
)
