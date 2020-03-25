<script>
    import { onMount } from 'svelte'
    import { fetchFromApi } from '../utils/fetchFromApi'

    let canvas
    let chartWidth = 800
    let chartHeight = 500
    let xOffset = 10
    let yOffset = 10
    let radius = 3
    let startAngle = 0
    let endAngle = 2 * Math.PI

    function drawCanvas() {
        const ctx = canvas.getContext('2d')

        ctx.beginPath()
        ctx.lineWidth = '3'
        ctx.strokeStyle = 'black'
        ctx.fillStyle = 'white'
        ctx.rect(0, 0, chartWidth, chartHeight)
        ctx.fillRect(0, 0, chartWidth, chartHeight)
        ctx.stroke()
    }

    function drawGraph(history) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, chartWidth, chartHeight)
        drawCanvas()

        const allValues = history
            .flat()
            .map(data => data.close)
            .flat()
        let minYValue = Math.min(...allValues)
        let maxYValue = Math.max(...allValues)

        const colours = ['red', 'blue', 'green', 'orange']
        for (const [index, item] of history.entries()) {
            const series = item.close.slice(0, currentDay)

            let yRange = maxYValue - minYValue
            let ySpacing = (chartHeight - yOffset) / yRange
            let xSpacing = (chartWidth - xOffset) / series.length

            for (const [i, value] of series.entries()) {
                const yCalc = (value - minYValue) * ySpacing
                const yPos = chartHeight - yCalc - yOffset / 2
                const xCalc = i * xSpacing
                const xPos = xCalc + xOffset

                ctx.beginPath()
                ctx.lineWidth = '1'
                ctx.strokeStyle = 'black'
                ctx.fillStyle = colours[index]
                ctx.arc(xPos, yPos, radius, startAngle, endAngle)
                ctx.fill()
                ctx.stroke()
            }
        }
    }

    onMount(() => {
        drawCanvas()
        // fetchAndPopulateStockData(options)
    })

    let options = [
        {
            title: 'S&P 500',
            symbol: 'SPY',
        },
        {
            title: 'Dow Jones Industrial Average',
            symbol: 'DHY',
        },
    ]

    let history = []
    let dates = []

    let currentDay = 0
    let currentStock = ''

    async function fetchSymbol(symbolQuery) {
        try {
            const result = await fetchFromApi(`/api/symbols/${symbolQuery}`)
            const data = await result.json()
            return data
        } catch (err) {
            console.info('Error retrieving this symbol')
            console.info(err)
            return null
        }
    }

    const handleSearchAndAddStock = async event => {
        const input = currentStock
            .trim()
            .replace('$', '')
            .toUpperCase()
        const alreadyExists = options.find(option => option.symbol === input)

        if (event.keyCode === 13) {
            if (input.length > 0 && input.length <= 5) {
                if (!alreadyExists) {
                    const result = await fetchSymbol(input)

                    if (result) {
                        options = [
                            ...options,
                            {
                                title: result.title,
                                symbol: result.symbol,
                            },
                        ]
                    } else {
                        alert(`Stock not found: ${input}`)
                    }
                } else {
                    alert(`Stock already selected: ${input}`)
                }
            } else {
                alert(
                    `Symbol should be between 1-5 characters excluding $: ${input}`
                )
            }
            currentStock = ''
        }
    }

    function getNewSymbols(entries, hist) {
        return entries.filter(stock => {
            return !hist.find(item => {
                return item.find(({ symbol }) => {
                    return stock === symbol
                })
            })
        })
    }

    async function fetchAndPopulateStockData(options) {
        const stocks = options.map(({ symbol }) => symbol)
        const newEntries = getNewSymbols(stocks, history)
        const stocksQuery = newEntries.join(',')

        try {
            const result = await fetchFromApi(
                `/api/stock?symbols=${stocksQuery}`
            )
            const data = await result.json()
            const { series, labels } = data
            history = [...history, ...series]

            if (labels.length !== dates.length) {
                dates = labels
            }
        } catch (err) {
            console.info('Error fetching stock data', stocks)
            console.info(err)
        }
    }

    $: {
        currentDay, history.length > 0 && drawGraph(history)
    }

    $: {
        options && fetchAndPopulateStockData(options)
    }
</script>

<svelte:head>
    <title>COVID-19 vs Markets</title>
</svelte:head>

<section class="text-center flex">
    <section class="m-auto">
        <header class="font-bold">
            <h1 class="text-4xl leading-relaxed">COVID-19 vs Markets</h1>
        </header>

        <input
            type="text"
            class="text-black"
            bind:value={currentStock}
            on:keyup={handleSearchAndAddStock} />

        {#if history.length === 0}
            <p>Loading...</p>
        {:else}
            <ul>
                {#each history as item}
                    <li>
                        <p>{item.symbol}</p>
                        <p>Opened at: {item.open[currentDay]}</p>
                        <p>Closed at: {item.close[currentDay]}</p>
                    </li>
                    <li class="h-4" />
                {/each}
            </ul>
        {/if}

        {#if dates.length !== 0}
            <section>
                <p>Slide below to show market prices since COVID-19 started</p>
                <input
                    type="range"
                    min="0"
                    max={dates.length - 1}
                    bind:value={currentDay} />
                <p>
                    Current date: {new Date(dates[currentDay] * 1000).toISOString()}
                </p>
                <p>Market trading days since COVID-19: {currentDay}</p>
            </section>
        {/if}

        <canvas bind:this={canvas} width={chartWidth} height={chartHeight} />
    </section>
</section>
