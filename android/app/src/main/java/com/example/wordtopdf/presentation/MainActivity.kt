package com.example.wordtopdf.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.collectAsState
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.wordtopdf.data.FakeDocxToPdfConverter
import com.example.wordtopdf.domain.ConvertDocxToPdfUseCase
import com.example.wordtopdf.presentation.convert.ConvertScreen
import com.example.wordtopdf.presentation.home.HomeScreen
import com.example.wordtopdf.presentation.result.ResultScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val vmFactory = SimpleViewModelFactory {
            MainViewModel(ConvertDocxToPdfUseCase(FakeDocxToPdfConverter()))
        }

        setContent {
            val vm: MainViewModel = viewModel(factory = vmFactory)
            val state = vm.uiState.collectAsState().value

            when {
                state.isConverting -> ConvertScreen()
                state.outputPath.isNotBlank() -> ResultScreen(
                    outputPath = state.outputPath,
                    onReset = { vm.onFileSelected("", "") }
                )

                else -> HomeScreen(
                    state = state,
                    onSelectSampleFile = {
                        vm.onFileSelected(
                            uri = "content://sample/document.docx",
                            fileName = "ornek.docx"
                        )
                    },
                    onConvertClick = vm::startConversion
                )
            }
        }
    }
}
