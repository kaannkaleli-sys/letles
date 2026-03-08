package com.example.wordtopdf.presentation.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.wordtopdf.presentation.MainUiState

@Composable
fun HomeScreen(
    state: MainUiState,
    onSelectSampleFile: () -> Unit,
    onConvertClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Word → PDF", style = MaterialTheme.typography.headlineSmall)
        Text("Offline dönüşüm prototipi")

        Button(onClick = onSelectSampleFile, modifier = Modifier.padding(top = 16.dp)) {
            Text("Örnek .docx seç")
        }

        if (state.selectedFileName.isNotBlank()) {
            Text("Seçilen: ${state.selectedFileName}", modifier = Modifier.padding(top = 12.dp))

            Button(onClick = onConvertClick, modifier = Modifier.padding(top = 12.dp)) {
                Text("PDF'e dönüştür")
            }
        }

        if (!state.errorMessage.isNullOrBlank()) {
            Text(
                text = state.errorMessage,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 12.dp)
            )
        }
    }
}
