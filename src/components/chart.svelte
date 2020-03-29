<script>
    export let stopValuesAt
    export let colors
    export let symbolToHighlight = null

    export let series
    export let labels

    let X_OFFSET = 10
    let Y_OFFSET = 10
    let LINE_WIDTH = 2
    let BORDER_COLOR = '#718096'
    let BORDER_BG_COLOR = '#fcfcfc'

    let canvas
    let ctx

    let currentHeight
    let currentWidth

    let docHeight
    let docWidth

    function drawCanvas(newWidth, newHeight) {
        ctx = canvas.getContext('2d')

        // adds line width to account for border
        ctx.clearRect(
            0,
            0,
            currentWidth + LINE_WIDTH,
            currentHeight + LINE_WIDTH
        )

        ctx.beginPath()
        ctx.lineWidth = LINE_WIDTH
        ctx.strokeStyle = BORDER_COLOR
        ctx.fillStyle = BORDER_BG_COLOR
        ctx.rect(0, 0, newWidth, newHeight)
        ctx.fillRect(0, 0, newWidth, newHeight)
        ctx.stroke()

        // set new canvas width and height as current
        currentWidth = docWidth
        currentHeight = docHeight
    }

    function drawGraph(valueSet) {
        const allValues = valueSet.flat()
        let minYValue = Math.min(...allValues)
        let maxYValue = Math.max(...allValues)

        for (const [i, item] of valueSet.entries()) {
            let yRange = maxYValue - minYValue
            let ySpacing = (currentHeight - Y_OFFSET) / yRange
            let xSpacing = (currentWidth - X_OFFSET) / item.length

            for (let j = 0; j < stopValuesAt; j++) {
                const xCalc = j * xSpacing
                const xPos = xCalc + X_OFFSET

                const yCalc = (item[j] - minYValue) * ySpacing
                const yPos = currentHeight - yCalc - Y_OFFSET / 2

                const nextIndex = j + 1
                const xCalc2 = nextIndex * xSpacing
                const xPos2 = xCalc2 + X_OFFSET

                const yCalc2 = (item[nextIndex] - minYValue) * ySpacing
                const yPos2 = currentHeight - yCalc2 - Y_OFFSET / 2

                ctx.beginPath()
                ctx.moveTo(xPos, yPos)
                ctx.lineTo(xPos2, yPos2)
                if (symbolToHighlight === i) {
                    ctx.lineWidth = 5
                } else {
                    ctx.lineWidth = 2
                }
                ctx.strokeStyle = colors[i]
                ctx.stroke()
            }
        }
    }

    function redrawChart() {
        canvas.width = docWidth
        canvas.height = docHeight
        drawCanvas(docWidth, docHeight)
        drawGraph(series)
    }

    $: {
        series.length > 0,
            labels.length > 0,
            docWidth,
            docHeight && redrawChart()
    }
</script>

<section bind:clientWidth={docWidth} bind:clientHeight={docHeight}>
    <canvas class="w-full" bind:this={canvas} />
</section>
