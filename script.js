const series = ["Pré 1", "Pré 2", "1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "EJA"];

function carregarTabela() {
    const tableBody = document.getElementById('alunosTable').getElementsByTagName('tbody')[0];
    const data = JSON.parse(localStorage.getItem('alunosData')) || [];
    
    data.forEach(rowData => {
        const newRow = tableBody.insertRow();
        newRow.insertCell(0).textContent = rowData.escola;

        let totalPorEscola = 0;
        series.forEach(serie => {
            const cell = newRow.insertCell();
            const cellContent = rowData[serie] ? rowData[serie].split('\n').join('<br>') : '';
            cell.innerHTML = cellContent;
            if (rowData[serie]) {
                const quantidadeMatches = rowData[serie].match(/- (\d+)/g);
                if (quantidadeMatches) {
                    quantidadeMatches.forEach(match => {
                        totalPorEscola += parseInt(match.replace('- ', ''));
                    });
                }
            }
        });

        const totalCell = newRow.insertCell();
        totalCell.textContent = totalPorEscola;

        const deleteCell = newRow.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'x';
        deleteBtn.onclick = function () {
            const rowIndex = newRow.rowIndex - 1;
            data.splice(rowIndex, 1);
            localStorage.setItem('alunosData', JSON.stringify(data));
            tableBody.deleteRow(newRow.rowIndex - 1);
            updateTotals();
        };
        deleteCell.appendChild(deleteBtn);
    });

    updateTotals();
}

function updateTotals() {
    const data = JSON.parse(localStorage.getItem('alunosData')) || [];
    let totalAlunosEF = 0;
    let totalAlunosEJA = 0;

    data.forEach(rowData => {
        series.forEach(serie => {
            if (rowData[serie]) {
                const quantidadeMatches = rowData[serie].match(/- (\d+)/g);
                if (quantidadeMatches) {
                    quantidadeMatches.forEach(match => {
                        const quantidade = parseInt(match.replace('- ', ''));
                        if (serie === "EJA") {
                            totalAlunosEJA += quantidade;
                        } else {
                            totalAlunosEF += quantidade;
                        }
                    });
                }
            }
        });
    });

    document.getElementById('totalAlunos').textContent = totalAlunosEF;
    document.getElementById('totalEJA').textContent = totalAlunosEJA;
    document.getElementById('totalGeral').textContent = totalAlunosEF + totalAlunosEJA;
}

function adicionarAluno(event) {
    event.preventDefault();
    
    const escola = document.getElementById('escola').value;
    const serie = document.getElementById('serie').value;
    const turma = document.getElementById('turma').value;
    const turno = document.getElementById('turno').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const isEJA = document.getElementById('eja').checked;

    const data = JSON.parse(localStorage.getItem('alunosData')) || [];
    let escolaData = data.find(d => d.escola === escola);
    
    if (!escolaData) {
        escolaData = { escola };
        series.forEach(serie => {
            escolaData[serie] = '';
        });
        data.push(escolaData);
    }

    const serieKey = isEJA ? 'EJA' : serie;
    const textoAtual = escolaData[serieKey] ? escolaData[serieKey] + '\n' : '';
    escolaData[serieKey] = textoAtual + `${turma} - ${quantidade} (${turno})`;

    localStorage.setItem('alunosData', JSON.stringify(data));

    const tableBody = document.getElementById('alunosTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    carregarTabela();

    document.getElementById('formAdicionar').reset();
}

function exportTableToExcel() {
    const table = document.getElementById('alunosTable');
    const workbook = XLSX.utils.table_to_book(table);
    XLSX.writeFile(workbook, 'tabela_alunos.xlsx');
}

document.getElementById('formAdicionar').addEventListener('submit', adicionarAluno);

window.onload = carregarTabela;
