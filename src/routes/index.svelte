<script>
    import { onMount } from 'svelte'
    import { stores, goto } from '@sapper/app'
    import { fetchFromApi } from '../utils/fetchFromApi.utils'
    import { getDateFromTimestamp } from '../utils/date.utils'
    import {
        getLocalStorageItem,
        setLocalStorageItem,
    } from '../utils/localStorage.utils'
    import Chart from '../components/Chart/Chart.svelte'
    import Loader from '../components/Loader/Loader.svelte'
    import Card from '../components/Card/Card.svelte'
    import EmptyCard from '../components/EmptyCard/EmptyCard.svelte'
    import SearchField from '../components/Search/Search.svelte'

    const { page } = stores()
    const { symbols, price } = $page.query

    const DEFAULT_OPTIONS = ['AMZN', 'GOOGL', 'SHOP', 'MSFT']

    const PRICE_OPTIONS = [
        {
            label: 'Open',
            value: 'open',
        },
        {
            label: 'Close',
            value: 'close',
        },
        {
            label: 'Low',
            value: 'low',
        },
        {
            label: 'High',
            value: 'high',
        },
    ]

    const DEFAULT_PRICE_OPTION = 'close'

    const LS_SYMBOLS = 'symbols'
    const LS_PRICE = 'price'

    let selectedPriceOption

    const LINE_COLORS = ['#b52b26', '#1c2db0', '#0f9429', '#d17819']

    let history = new Map()

    let dates = []
    let labels = []
    let seriesList = []

    let currentDay = 0
    let currentStock = ''

    let loading = false
    let highlightedSymbolIndex = null

    let isDocumentReady = false

    onMount(async () => {
        let selectedSymbols = []

        selectedPriceOption = getDefaultPriceOption(price)

        selectedSymbols = getDefaultOptions(symbols)
        await fetchStockData(selectedSymbols)

        isDocumentReady = true
    })

    const getDefaultOptions = symbols => {
        if (symbols) {
            return symbols.split(',')
        }

        const storedSymbols = getLocalStorageItem(LS_SYMBOLS)

        if (storedSymbols) {
            return storedSymbols.split(',')
        }

        return DEFAULT_OPTIONS
    }

    const getDefaultPriceOption = price => {
        if (price && priceOptionExists(price)) {
            return price
        }

        const storedPrice = getLocalStorageItem(LS_PRICE)

        if (storedPrice && priceOptionExists(storedPrice)) {
            return storedPrice
        }

        return DEFAULT_PRICE_OPTION
    }

    const updateQueryParams = (history, priceOption) => {
        const currentSymbols = Array.from(history.keys())
        let queryParams = '?'

        if (currentSymbols.length > 0) {
            queryParams += `symbols=${currentSymbols.join(',')}&`
        }
        queryParams += `price=${priceOption}`

        goto(queryParams)
    }

    const isValidSymbol = symbol => symbol.length > 0 && symbol.length <= 5

    const getValidSymbolsToFetch = (stocks, history) => {
        return stocks.filter(stock => {
            return isValidSymbol(stock) && !history.get(stock)
        })
    }

    const updateSeries = (history, priceSelected) => {
        seriesList = []
        for (let value of history.values()) {
            let prices = value[priceSelected]
            seriesList = [...seriesList, [...prices]]
        }
    }

    const saveSelectedSymbols = history => {
        const currentSymbols = Array.from(history.keys())
        let symbolList = ''

        if (currentSymbols.length > 0) {
            symbolList = currentSymbols.join(',')
            setLocalStorageItem(LS_SYMBOLS, symbolList)
        } else {
            setLocalStorageItem(LS_SYMBOLS, symbolList)
        }
    }

    const saveSelectedPrice = selectedPriceOption => {
        setLocalStorageItem(LS_PRICE, selectedPriceOption)
    }

    const priceOptionExists = price =>
        PRICE_OPTIONS.find(({ value }) => value === price)

    const addNewSymbol = async input => {
        const symbol = input
            .trim()
            .replace('$', '')
            .toUpperCase()

        if (isValidSymbol(symbol)) {
            const alreadyExists = history.has(symbol)
            if (!alreadyExists) {
                await fetchStockData(symbol)
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

    const handleSearchAndAddStock = async () => {
        await addNewSymbol(currentStock)
    }

    const handleHighlightSymbol = (symbolIndex = null) => {
        highlightedSymbolIndex = symbolIndex
    }

    const resetHighlightedSymbol = () => {
        highlightedSymbolIndex = null
    }

    const fetchStockData = async symbols => {
        const options = [].concat(symbols) // compatible with string and array
        const newEntries = getValidSymbolsToFetch(options, history)
        const stocksQuery = newEntries.join(',')

        loading = true

        try {
            const result = await fetchFromApi(
                `/api/stock?symbols=${stocksQuery}`
            )
            const data = await result.json()
            const { series, labels } = data

            const errorSymbols = []
            for (let { symbol, open, close, high, low, error } of series) {
                if (!error) {
                    history = history.set(symbol, {
                        symbol: symbol,
                        open: open,
                        close: close,
                        high: high,
                        low: low,
                    })
                } else {
                    errorSymbols.push(symbol)
                }
            }

            if (dates.length === 0) {
                dates = labels
            }

            loading = false

            if (errorSymbols.length > 0) {
                alert(
                    `Error retrieving the following symbols: ${errorSymbols.join(
                        ','
                    )}`
                )
            }
        } catch (err) {
            console.info('Error fetching stock data', options)
            console.info(err)
        }
    }

    const updateCurrentDay = newDay => {
        currentDay = newDay
    }

    $: {
        currentDay,
            highlightedSymbolIndex,
            history && updateSeries(history, selectedPriceOption)
    }

    $: {
        dates.length > 0 && updateCurrentDay(dates.length - 1)
    }

    $: {
        labels = dates.map(date => getDateFromTimestamp(date))
    }

    $: {
        history &&
            selectedPriceOption &&
            isDocumentReady &&
            updateQueryParams(history, selectedPriceOption)
    }

    $: {
        history.size && resetHighlightedSymbol()
    }

    $: {
        selectedPriceOption &&
            isDocumentReady &&
            saveSelectedPrice(selectedPriceOption)
    }

    $: {
        history && isDocumentReady && saveSelectedSymbols(history)
    }
</script>

<svelte:head>
    <title>COVID-19 vs Markets</title>
</svelte:head>

<section class="flex sm:flex-col md:flex-row">
    <section class="flex-grow-0">
        <aside
            class="border-r border-solid border-gray-600 px-8 my-8 items-center
            justify-center">

            <SearchField
                bind:value={currentStock}
                disabled={history.size >= 4 || loading}
                on:click={() => addNewSymbol(currentStock)}
                on:enter={handleSearchAndAddStock} />

            <ul>
                {#each Array.from(history.values()) as item, idx (item.symbol)}
                    <Card
                        {item}
                        color={LINE_COLORS[idx]}
                        options={PRICE_OPTIONS}
                        selected={selectedPriceOption}
                        current={currentDay}
                        on:mouseenter={() => handleHighlightSymbol(idx)}
                        on:mouseleave={() => handleHighlightSymbol(null)}
                        on:delete={() => deleteSymbol(item.symbol)} />
                    <li class="h-4" />
                {/each}
                {#each Array(4 - history.size) as _, idx}
                    <EmptyCard>
                        {#if loading}
                            <Loader />
                        {:else}?{/if}
                    </EmptyCard>
                    <li class="h-4" />
                {/each}
            </ul>
        </aside>
    </section>

    <section class="flex-grow text-center">
        <header class="font-bold">
            <h1 class="text-4xl text-gray-600 px-2">COVID-19 vs. Markets</h1>
        </header>

        {#if dates.length !== 0 && !loading}
            <section class="text-xl py-2">
                <p>
                    Selected date:
                    <strong>{getDateFromTimestamp(dates[currentDay])}</strong>
                </p>
                <p>
                    Market trading days since COVID-19:
                    <strong data-testId="current-day">{currentDay + 1}</strong>
                </p>
            </section>
        {/if}

        <section class="flex justify-around pb-2">
            {#each PRICE_OPTIONS as options}
                <label>
                    <input
                        type="radio"
                        bind:group={selectedPriceOption}
                        checked={options.value === selectedPriceOption}
                        value={options.value} />
                    {`${options.label} prices`}
                </label>
            {/each}
        </section>

        <section class="mx-10">
            <Chart
                series={seriesList}
                stopValuesAt={currentDay}
                colors={LINE_COLORS}
                xLabels={labels}
                symbolToHighlight={highlightedSymbolIndex} />
        </section>

        <p class="py-2">
            Use the slider to show the affect of COVID-19 on selected indexes
        </p>

        <input
            class="w-2/3"
            type="range"
            aria-label="Date slider"
            min="0"
            max={dates.length - 1}
            bind:value={currentDay} />
    </section>
</section>
