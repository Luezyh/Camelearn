const ctx = document.getElementById('graficoNotas');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            label: 'Média das notas',
            data: [5.5, 6.2, 7.0, 7.5, 8.1, 8.7],
            borderColor: '#2e7d32',
            backgroundColor: '#66bb6a',
            tension: 0.3,
            fill: false
        }]
    },
    options: {
        plugins: {
            legend: {
                display: true
            }
        },
        scales: {
            y: {
                min: 0,
                max: 10
            }
        }
    }

});