<script>
    import { onMount } from 'svelte'

    let canvas
    let ctx

    export let height
    export let width

    export let series
    export let labels

    let X_OFFSET = 10
    let Y_OFFSET = 10
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
        let minYValue = Math.min(...allValues.filter(value => value !== null))
        let maxYValue = Math.max(...allValues)

        for (const [i, item] of valueSet.entries()) {
            let yRange = maxYValue - minYValue
            let ySpacing = (height - Y_OFFSET) / yRange
            let xSpacing = (width - X_OFFSET) / item.length

            for (const [j, value] of item.entries()) {
                if (value) {
                    const xCalc = j * xSpacing
                    const xPos = xCalc + X_OFFSET

                    const yCalc = (value - minYValue) * ySpacing
                    const yPos = height - yCalc - Y_OFFSET / 2

                    if (item[j + 1]) {
                        const xCalc2 = (j + 1) * xSpacing
                        const xPos2 = xCalc2 + X_OFFSET

                        const yCalc2 = (item[j + 1] - minYValue) * ySpacing
                        const yPos2 = height - yCalc2 - Y_OFFSET / 2

                        ctx.beginPath()
                        ctx.moveTo(xPos, yPos)
                        ctx.lineTo(xPos2, yPos2)
                        ctx.stroke()
                    }
                }
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
        series.length > 0, labels.length > 0 && drawGraph(series)
    }
</script>

<style>

</style>

<canvas bind:this={canvas} {width} {height} />
