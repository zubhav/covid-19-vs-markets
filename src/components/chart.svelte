<script>
    import { onMount } from 'svelte'

    let canvas
    let ctx

    export let height
    export let width

    export let series
    // export let labels

    let xOffset = 10
    let yOffset = 10
    let radius = 3
    let startAngle = 0
    let endAngle = 2 * Math.PI

    let colours = ['red', 'blue', 'green', 'orange']

    onMount(() => {
        drawCanvas()
    })

    function drawCanvas() {
        ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.lineWidth = '3'
        ctx.strokeStyle = 'black'
        ctx.fillStyle = 'white'
        ctx.rect(0, 0, width, height)
        ctx.fillRect(0, 0, width, height)
        ctx.stroke()
    }

    function drawGraph(valueSet) {
        ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, width, height)
        drawCanvas()

        const allValues = valueSet.flat()
        let minYValue = Math.min(...allValues)
        let maxYValue = Math.max(...allValues)

        for (const [index, item] of valueSet.entries()) {
            let yRange = maxYValue - minYValue
            let ySpacing = (height - yOffset) / yRange
            let xSpacing = (width - xOffset) / item.length

            for (const [i, value] of item.entries()) {
                const yCalc = (value - minYValue) * ySpacing
                const yPos = height - yCalc - yOffset / 2

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

    $: {
        series.length > 0 && drawGraph(series)
    }
</script>

<style>

</style>

<canvas bind:this={canvas} {width} {height} />
