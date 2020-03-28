<script>
    import { onMount } from 'svelte'
    import { fetchFromApi } from '../utils/fetchFromApi'
    import Chart from '../components/chart.svelte'

    const chartWidth = 800
    const chartHeight = 500

    const DEFAULT_OPTIONS = [
        {
            symbol: 'DHY',
        },
        {
            symbol: 'BLE',
        },
        {
            symbol: 'JPM',
        },
        {
            symbol: 'SPY',
        },
    ]

    const LINE_COLORS = ['#b52b26', '#1c2db0', '#0f9429', '#d17819']

    let history = new Map()

    let dates = []
    let labels = []
    let seriesList = []

    let currentDay = 0
    let currentStock = ''

    onMount(() => {
        fetchStockData(DEFAULT_OPTIONS)
    })

    const getNewSymbols = (stocks, history) => {
        return stocks.filter(stock => !history.get(stock))
    }

    const padZero = num => (num < 10 ? `0${num}` : `${num}`)

    const getDateFromTimestamp = timestamp => {
        const dateObj = new Date(timestamp * 1000)
        const year = dateObj.getFullYear()
        const month = padZero(dateObj.getMonth() + 1)
        const day = padZero(dateObj.getDate())
        return `${day}/${month}/${year}`
    }

    const updateSeries = history => {
        seriesList = []

        for (let value of history.values()) {
            seriesList = [...seriesList, [...value.close]]
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

    const addNewSymbol = async input => {
        const symbol = input
            .trim()
            .replace('$', '')
            .toUpperCase()

        if (symbol.length > 0 && symbol.length <= 5) {
            const alreadyExists = history.has(symbol)
            if (!alreadyExists) {
                const result = await fetchSymbol(symbol)
                if (result) {
                    await fetchStockData([result])
                } else {
                    alert(`Stock not found: ${symbol}`)
                }
            } else {
                alert(`Stock already selected: ${symbol}`)
            }
        } else {
            alert(
                `Symbol should be between 1-5 characters excluding $: ${symbol}`
            )
        }
        currentStock = ''
    }

    const deleteSymbol = symbol => {
        history.delete(symbol)
        history = history
    }

    const handleSearchAndAddStock = async event => {
        if (event.keyCode === 13) {
            await addNewSymbol(currentStock)
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

            for (let { symbol, open, close, high, low } of series) {
                history = history.set(symbol, {
                    symbol: symbol,
                    open: open,
                    close: close,
                    high: high,
                    low: low,
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

    const updateCurrentDay = newDay => {
        currentDay = newDay
    }

    const getColorByStockPerf = (list, index) => {
        const curr = list[index]
        const prev = list[index - 1]

        if (prev && curr < prev) {
            return 'red'
        }

        return 'green'
    }

    $: {
        currentDay, history && updateSeries(history)
    }

    $: {
        dates.length > 0 && updateCurrentDay(dates.length - 1)
    }

    $: {
        labels = dates.map(date => getDateFromTimestamp(date))
    }
</script>

<svelte:head>
    <title>COVID-19 vs Markets</title>
</svelte:head>

<section class="flex">
    <section class="w-1/4">
        <aside
            class="w-full h-full border-r border-solid border-gray-600 p-4 m-4
            items-center justify-center">
            <section class="flex text-gray-600 mb-4 relative">
                <span
                    class="absolute top-0 left-0 h-full flex px-2 items-center
                    justify-center border-r border-solid border-gray-600">
                    &#36;
                </span>
                <input
                    type="text"
                    class="w-full h-10 pl-10 border border-solid border-gray-600
                    rounded-lg placeholder-gray-600"
                    placeholder="Add a new symbol..."
                    disabled={history.size >= 4}
                    bind:value={currentStock}
                    on:keyup={handleSearchAndAddStock} />
                <button
                    class="absolute right-0 top-0 h-full flex justify-center
                    items-center text-2xl w-10 border-l border-solid
                    border-gray-600"
                    on:click={() => addNewSymbol(currentStock)}
                    disabled={history.size >= 4}>
                    &plus;
                </button>
            </section>

            {#if history.size === 0}
                <p>Loading...</p>
            {:else}
                <ul>
                    {#each Array.from(history.values()) as item, idx (item.symbol)}
                        <li
                            class="border border-solid border-gray-600 p-2 h-32
                            rounded-md">
                            <button
                                class="float-right"
                                on:click|once={() => deleteSymbol(item.symbol)}>
                                &times;
                            </button>
                            <section>
                                <span
                                    class="text-lg text-white tracking-wide p-1
                                    mb-1 rounded-md"
                                    style={`background-color: ${LINE_COLORS[idx]};`}>
                                    &#36;{item.symbol}
                                </span>
                                <section class="text-sm">
                                    <p>
                                        Open:
                                        <strong
                                            style={`color: ${getColorByStockPerf(item.open, currentDay)}`}>
                                            {item.open[currentDay]}
                                        </strong>
                                    </p>
                                    <p>
                                        Close:
                                        <strong
                                            style={`color: ${getColorByStockPerf(item.close, currentDay)}`}>
                                            {item.close[currentDay]}
                                        </strong>
                                    </p>
                                    <p>
                                        Low:
                                        <strong
                                            style={`color: ${getColorByStockPerf(item.low, currentDay)}`}>
                                            {item.low[currentDay]}
                                        </strong>
                                    </p>
                                    <p>
                                        High:
                                        <strong
                                            style={`color: ${getColorByStockPerf(item.high, currentDay)}`}>
                                            {item.high[currentDay]}
                                        </strong>
                                    </p>
                                </section>
                            </section>
                        </li>
                        <li class="h-4" />
                    {/each}
                    {#each Array(4 - history.size) as _}
                        <li class="bg-gray-300 flex items-center p-2 h-32">
                            <p
                                class="text-center text-6xl text-gray-600 w-full">
                                ?
                            </p>
                        </li>
                        <li class="h-4" />
                    {/each}
                </ul>
            {/if}

        </aside>
    </section>
    <section class="w-3/4 text-center">
        <header class="font-bold">
            <h1 class="text-4xl py-4 text-gray-600">COVID-19 vs. Markets</h1>
        </header>

        <Chart
            width={chartWidth}
            height={chartHeight}
            series={seriesList}
            stopValuesAt={currentDay}
            {labels}
            colors={LINE_COLORS} />

        {#if dates.length !== 0}
            <section class="text-sm py-2">
                <p>
                    Use the slider to show the affect of COVID-19 on selected
                    indexes
                </p>

                <p>
                    Selected date:
                    <strong>{getDateFromTimestamp(dates[currentDay])}</strong>
                </p>
                <p>
                    Market trading days since COVID-19:
                    <strong>{currentDay + 1}</strong>
                </p>
            </section>
            <input
                class="w-2/3"
                type="range"
                min="0"
                max={dates.length - 1}
                bind:value={currentDay} />
        {/if}
    </section>
</section>
