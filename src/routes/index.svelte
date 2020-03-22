<script>
  import { onMount } from "svelte";

  const API_KEY = "bpql2ivrh5reqvv1brr0";

  let options = [
    {
      title: "S&P 500",
      symbol: "SPY"
    },
    {
      title: "Dow Jones Industrial Average",
      symbol: "DHY"
    }
	];
	
	let history = []

	let currentDay = 0;
	let currentStock = ""
	let maxNumberOfDays

	async function fetchSymbol(symbolQuery) {
		try {
			const result = await fetch(`/api/symbols/${symbolQuery}`)
			const data = await result.json()
			const symbol = await data
			return symbol
		} catch(err) {
			console.info("Error retrieving this symbol")
			console.info(err)
		}
	}

  const handleSearch = async event => {
		const input = currentStock.trim().toUpperCase()
		const alreadyExists = options.find(option => options.symbol === input)

		if(!alreadyExists) {
			if (event.keyCode === 13 && input.length > 0) {
				const result = await fetchSymbol(input)

				if(result) {
					options = [
						...options,
						{
							title: result.description,
							symbol: result.symbol
						}
					];
				}	else {
					alert("Stock not found");
				}
				
				currentStock = ""
			} 
		} else {
			alert("Stock already selected");
		}
  };

  onMount(async () => {
		await fetchAndPopulateData(options)
	});

  async function fetchAndPopulateData(options) {
		const stocks = options.map(({ symbol }) => symbol)
		const stocksQuery = stocks.join(',')

		try {
			const result = await fetch(`/api/stock?symbols=${stocksQuery}`)
			const data = await result.json()
			const { series, days } = data
			history = [...history, ...series]
			maxNumberOfDays = days
		} catch(err) {
			console.info("Error fetching stock data", stocks)
			console.info(err)
		}
  }

	$: {
  		options && fetchAndPopulateData(options);
	}

	$: console.log(history)
</script>

<svelte:head>
  <title>COVID-19 vs Markets</title>
</svelte:head>

<section class="text-center flex h-screen">
  <section class="m-auto">

    <header class="font-bold">
      <h1 class="text-4xl leading-relaxed">COVID-19 vs Markets</h1>
    </header>

    <input
      type="text"
      class="text-black"
      bind:value={currentStock}
      on:keyup={handleSearch} 
	/>

    {#if history.length === 0}
      <p>Loading...</p>
    {:else}
      <ul>
        {#each history as item (item.symbol)}
          <li>
            <p>{item.symbol}</p>
            <p>Opened at: {item.open[currentDay]}</p>
            <p>Closed at: {item.close[currentDay]}</p>
          </li>
          <li class="h-4" />
        {/each}
      </ul>
    {/if}

    {#if history.length !== 0}
      <section>
        <p>Slide below to show market prices since COVID-19 started</p>
        <input
          type="range"
          min="0"
          max={maxNumberOfDays - 1}
          bind:value={currentDay}
				/>
        <p>Current date: {history[0].time[currentDay]}</p>
        <p>Market trading days since COVID-19: {currentDay}</p>
      </section>
    {/if}
  </section>
</section>
