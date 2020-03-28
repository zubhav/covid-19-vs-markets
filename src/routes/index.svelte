<script>
    import { onMount } from 'svelte'
    import { fetchFromApi } from '../utils/fetchFromApi'
    import Chart from '../components/chart.svelte'

    let chartWidth = 800
    let chartHeight = 500

    let defaultOptions = [
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
            class="w-full h-full border-r border-solid border-gray p-4 m-4
            items-center justify-center">
            <section class="flex text-gray pb-4">
                <span class="w-6 text-center">&#36;</span>
                <input
                    type="text"
                    class="w-full border-b border-solid border-gray"
                    placeholder="Add a new symbol..."
                    disabled={history.size >= 4}
                    bind:value={currentStock}
                    on:keyup={handleSearchAndAddStock} />
                {#if history.size < 4}
                    <button
                        class="w-8 border border-solid border-gray p-4"
                        on:click={() => addNewSymbol(currentStock)}>
                        &plus;
                    </button>
                {/if}
            </section>

            {#if history.size === 0}
                <p>Loading...</p>
            {:else}
                <ul>
                    {#each Array.from(history.values()) as item (item.symbol)}
                        <li class="border border-solid border-black p-2 h-32">
                            <button
                                class="float-right"
                                on:click|once={() => deleteSymbol(item.symbol)}>
                                &times;
                            </button>
                            <section>
                                <h3 class="text-lg">&#36;{item.symbol}</h3>
                                <section class="text-sm">
                                    <p>
                                        Opened at:
                                        <strong>{item.open[currentDay]}</strong>
                                    </p>
                                    <p>
                                        Closed at:
                                        <strong>
                                            {item.close[currentDay]}
                                        </strong>
                                    </p>
                                    <p>
                                        Low:
                                        <strong>{item.low[currentDay]}</strong>
                                    </p>
                                    <p>
                                        High:
                                        <strong>{item.high[currentDay]}</strong>
                                    </p>
                                </section>
                            </section>
                        </li>
                        <li class="h-4" />
                    {/each}
                    {#each Array(4 - history.size) as _}
                        <li class="p-2 h-32 bg-gray-300 flex items-center">
                            <p
                                class="text-center text-6xl text-gray-600 w-full
                                ">
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
            <h1 class="text-4xl py-4">COVID-19 vs. Markets</h1>
        </header>

        <Chart
            width={chartWidth}
            height={chartHeight}
            series={seriesList}
            stopValuesAt={currentDay}
            {labels} />

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
