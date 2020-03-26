<script>
    import { onMount } from 'svelte'
    import { fetchFromApi } from '../utils/fetchFromApi'
    import Chart from '../components/chart.svelte'

    let chartWidth = 800
    let chartHeight = 500

    let defaultOptions = [
        {
            title: 'S&P 500',
            symbol: 'SPY',
        },
        {
            title: 'Dow Jones Industrial Average',
            symbol: 'DHY',
        },
    ]

    let history = new Map()
    let dates = []
    let labels = []
    let seriesList = []

    let currentDay = 0
    let currentStock = ''

    onMount(() => {
        fetchStockData(defaultOptions)
    })

    const getNewSymbols = (stocks, history) => {
        return stocks.filter(stock => !history.get(stock))
    }

    const getDateFromTimestamp = timestamp => {
        return new Date(timestamp * 1000).toISOString()
    }

    const updateSeries = stockData => {
        seriesList = []

        const valuesToSlice = currentDay + 1

        for (let value of stockData.values()) {
            const remainingToFill = value.close.length - currentDay - 1

            seriesList = [
                ...seriesList,
                [
                    ...value.close.slice(0, valuesToSlice),
                    ...Array(remainingToFill).fill(null),
                ],
            ]
        }
    }

    const fetchSymbol = async symbolQuery => {
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
        if (event.keyCode === 13) {
            const input = currentStock
                .trim()
                .replace('$', '')
                .toUpperCase()
            const alreadyExists = history.has(input)
            if (input.length > 0 && input.length <= 5) {
                if (!alreadyExists) {
                    const result = await fetchSymbol(input)

                    if (result) {
                        await fetchStockData([result])
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

    const fetchStockData = async options => {
        const stocks = options.map(({ symbol }) => symbol)
        const newEntries = getNewSymbols(stocks, history)
        const stocksQuery = newEntries.join(',')

        try {
            const result = await fetchFromApi(
                `/api/stock?symbols=${stocksQuery}`
            )
            const data = await result.json()
            const { series, labels } = data

            for (let { symbol, open, close } of series) {
                history = history.set(symbol, {
                    symbol: symbol,
                    open: open,
                    close: close,
                })
            }

            if (labels.length !== dates.length) {
                dates = labels
            }
        } catch (err) {
            console.info('Error fetching stock data', stocks)
            console.info(err)
        }
    }

    $: {
        currentDay, history.size > 0 && updateSeries(history)
    }

    $: {
        labels = dates.map(date => getDateFromTimestamp(date))
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

        {#if history.size === 0}
            <p>Loading...</p>
        {:else}
            <ul>
                {#each Array.from(history.values()) as item}
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
                <p>Current date: {getDateFromTimestamp(dates[currentDay])}</p>
                <p>Market trading days since COVID-19: {currentDay}</p>
            </section>
        {/if}

        <Chart
            width={chartWidth}
            height={chartHeight}
            series={seriesList}
            {labels} />
    </section>
</section>
