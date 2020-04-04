<script>
    import { createEventDispatcher } from 'svelte'

    export let value
    export let disabled

    const dispatch = createEventDispatcher()

    function onKeyUp(event) {
        if (event.keyCode === 13) {
            dispatch('enter', event)
        }
    }
</script>

<section class="flex text-gray-600 mb-4 relative">
    <span
        class="absolute top-0 left-0 h-full flex px-2 items-center
        justify-center border rounded-l-lg border-solid border-gray-600 bg-green
        text-white">
        &#36;
    </span>
    <input
        type="text"
        class="h-10 pl-10 border border-solid border-gray-600 rounded-lg
        placeholder-gray-600 disabled:cursor-not-allowed"
        placeholder="Add a new symbol..."
        {disabled}
        bind:value
        on:keyup={onKeyUp} />
    <button
        class="absolute right-0 top-0 h-full flex justify-center items-center
        text-2xl w-10 border rounded-r-lg border-solid border-gray-600 bg-green
        text-white"
        aria-label="Add symbol"
        on:click={() => dispatch('click')}
        {disabled}>
        &plus;
    </button>
</section>
