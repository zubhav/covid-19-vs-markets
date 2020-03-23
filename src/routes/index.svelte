<script>
  import { onMount } from "svelte";
  import { fetchFromApi } from "../utils/fetchFromApi";

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

  let history = [];

  let currentDay = 0;
  let currentStock = "";
  let maxNumberOfDays;

  async function fetchSymbol(symbolQuery) {
    try {
      const result = await fetchFromApi(`/api/symbols/${symbolQuery}`);
      const data = await result.json();
      return data;
    } catch (err) {
      console.info("Error retrieving this symbol");
      console.info(err);
    }
  }

  const handleSearchAndAddStock = async event => {
    const input = currentStock
      .trim()
      .replace("$", "")
      .toUpperCase();
    const alreadyExists = options.find(option => option.symbol === input);

    if (event.keyCode === 13) {
      if (input.length > 0 && input.length <= 5) {
        if (!alreadyExists) {
          const result = await fetchSymbol(input);

          if (result) {
            options = [
              ...options,
              {
                title: result.title,
                symbol: result.symbol
              }
            ];
          } else {
            alert(`Stock not found: ${input}`);
          }
        } else {
          alert(`Stock already selected: ${input}`);
        }
      } else {
        alert(`Symbol should be between 1-5 characters excluding $: ${input}`);
      }
      currentStock = "";
    }
  };

  function getNewSymbols(entries, hist) {
    return entries.filter(stock => {
      return !hist.find(item => {
        return item.find(({ symbol }) => {
          return stock === symbol;
        });
      });
    });
  }
  async function fetchAndPopulateStockData(options) {
    const stocks = options.map(({ symbol }) => symbol);
    const newEntries = getNewSymbols(stocks, history);
    const stocksQuery = newEntries.join(",");

    try {
      const result = await fetchFromApi(`/api/stock?symbols=${stocksQuery}`);
      const data = await result.json();
      const { series, days } = data;
      history = [...history, ...series];
      maxNumberOfDays = days;
    } catch (err) {
      console.info("Error fetching stock data", stocks);
      console.info(err);
    }
  }

  $: {
    fetchAndPopulateStockData(options);
  }
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
      on:keyup={handleSearchAndAddStock} />

    {#if history.length === 0}
      <p>Loading...</p>
    {:else}
      <ul>
        {#each history as symbol}
          {#each symbol as item (item.symbol)}
            <li>
              <p>{item.symbol}</p>
              <p>Opened at: {item.open[currentDay]}</p>
              <p>Closed at: {item.close[currentDay]}</p>
            </li>
          {/each}
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
          bind:value={currentDay} />
        <p>Current date: {history[0][0].time[currentDay]}</p>
        <p>Market trading days since COVID-19: {currentDay}</p>
      </section>
    {/if}
  </section>
</section>
