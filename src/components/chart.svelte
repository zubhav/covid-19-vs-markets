<script>
    import { onMount } from 'svelte'

    let canvas
    let ctx

    export let height
    export let width
    export let stopValuesAt
    export let colors
    export let symbolToHighlight

    export let series
    export let labels

    let X_OFFSET = 10
    let Y_OFFSET = 10

    onMount(() => {
        drawCanvas()
    })

    function drawCanvas() {
        ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.lineWidth = 2
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

        for (const [i, item] of valueSet.entries()) {
            let yRange = maxYValue - minYValue
            let ySpacing = (height - Y_OFFSET) / yRange
            let xSpacing = (width - X_OFFSET) / item.length

            for (let j = 0; j < stopValuesAt; j++) {
                const xCalc = j * xSpacing
                const xPos = xCalc + X_OFFSET

                const yCalc = (item[j] - minYValue) * ySpacing
                const yPos = height - yCalc - Y_OFFSET / 2

                const nextIndex = j + 1
                const xCalc2 = nextIndex * xSpacing
                const xPos2 = xCalc2 + X_OFFSET

                const yCalc2 = (item[nextIndex] - minYValue) * ySpacing
                const yPos2 = height - yCalc2 - Y_OFFSET / 2

                ctx.beginPath()
                ctx.moveTo(xPos, yPos)
                ctx.lineTo(xPos2, yPos2)
                if (symbolToHighlight && symbolToHighlight === i) {
                    ctx.lineWidth = 5
                } else {
                    ctx.lineWidth = 2
                }
                ctx.strokeStyle = colors[i]
                ctx.stroke()
            }
        }

        // let labelSpacing = (width - X_OFFSET) / labels.length
        // for (const [i, label] of labels.entries()) {
        //     const xCalc = i * labelSpacing
        //     const xPos = xCalc + X_OFFSET

        //     ctx.font = '20px serif'
        //     ctx.textAlign = 'center'
        //     ctx.textBaseline = 'center'
        //     ctx.translate(width / 2, height / 2)
        //     ctx.save()

        //     ctx.rotate((90 * Math.PI) / 180)
        //     ctx.fillText('a', xPos, height - 250)
        //     ctx.restore()
        // }
    }

    $: {
        series.length > 0 && stopValuesAt >= 0,
            labels.length > 0 && drawGraph(series)
    }
</script>

<canvas class="m-auto" bind:this={canvas} {width} {height} />
