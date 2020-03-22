<script>
	export let status;
	export let error;

	const dev = process.env.NODE_ENV === 'development';
</script>

<svelte:head>
	<title>{status} - {error.message}</title>
</svelte:head>

<div class="text-center flex h-screen">
	<div class="m-auto">
		<h1 class="text-4xl font-bold leading-relaxed">{status}</h1>
		<h2 class="text-lg font-bold pt-2">{error.message}</h2>
	</div>
</div>

{#if dev && error.stack}
	<pre>{error.stack}</pre>
{/if}
