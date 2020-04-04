<script>
    import { createEventDispatcher } from 'svelte'

    export let item
    export let color
    export let options
    export let selected
    export let current

    const dispatch = createEventDispatcher()

    const getColorByStockPerf = (list, index) => {
        const curr = list[index]
        const prev = list[index - 1]

        if (prev && curr < prev) {
            return 'red'
        }

        return 'green'
    }
</script>

<li
    class="border border-solid border-gray-600 p-2 h-36 rounded-md relative
    cursor-pointer"
    on:mouseenter={() => dispatch('mouseenter')}
    on:mouseleave={() => dispatch('mouseleave')}>
    <button
        aria-label="Remove symbol"
        class="absolute top-0 right-0 px-0 m-1 bg-red text-white rounded-md h-4
        w-4 leading-none"
        on:click|once={() => dispatch('delete')}>
        &times;
    </button>
    <section>
        <span
            class="text-lg text-white tracking-wide p-1 mb-1 rounded-md"
            style={`background-color: ${color};`}>
            &#36;{item.symbol}
        </span>
        <section class="text-sm py-2">
            <table class="table-auto w-full">
                <tbody>
                    {#each options as option}
                        <tr>
                            <td class="pr-4">
                                {option.label}
                                {#if option.value === selected}(selected){/if}
                            </td>
                            <td class="text-right">
                                <strong
                                    style={`color: ${getColorByStockPerf(item[option.value], current)}`}>
                                    {item[option.value][current]}
                                </strong>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    </section>
</li>
