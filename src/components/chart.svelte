<script>
    export let stopValuesAt
    export let colors
    export let symbolToHighlight = null

    export let series
    export let xLabels

    let X_OFFSET = 10
    let Y_OFFSET = 10
    let LINE_WIDTH = 2
    let BORDER_COLOR = '#718096'
    let BORDER_BG_COLOR = '#fcfcfc'

    let canvas
    let ctx

    let docHeight
    let docWidth

    let chartHeight
    let chartWidth

    function drawCanvas(newWidth, newHeight) {
        ctx = canvas.getContext('2d')

        ctx.beginPath()
        ctx.lineWidth = LINE_WIDTH
        ctx.strokeStyle = BORDER_COLOR
        ctx.fillStyle = BORDER_BG_COLOR
        ctx.rect(0, 0, newWidth, newHeight)
        ctx.fillRect(0, 0, newWidth, newHeight)
        ctx.stroke()
    }

    function drawGraph(valueSet) {
        const allValues = valueSet.flat()
        let minYValue = Math.min(...allValues)
        let maxYValue = Math.max(...allValues)

        for (const [i, item] of valueSet.entries()) {
            let yRange = maxYValue - minYValue
            let ySpacing = (chartHeight - Y_OFFSET) / yRange
            let xSpacing = (chartWidth - X_OFFSET) / item.length

            for (let j = 0; j < stopValuesAt; j++) {
                const xCalc = j * xSpacing
                const xPos = xCalc + X_OFFSET

                const yCalc = (item[j] - minYValue) * ySpacing
                const yPos = chartHeight - yCalc - Y_OFFSET / 2

                const nextIndex = j + 1

                const xCalc2 = nextIndex * xSpacing
                const xPos2 = xCalc2 + X_OFFSET

                const yCalc2 = (item[nextIndex] - minYValue) * ySpacing
                const yPos2 = chartHeight - yCalc2 - Y_OFFSET / 2

                ctx.beginPath()
                ctx.lineJoin = 'round'
                ctx.moveTo(xPos, yPos)
                ctx.lineTo(xPos2, yPos2)
                if (symbolToHighlight === i) {
                    ctx.lineWidth = 5
                } else {
                    ctx.lineWidth = LINE_WIDTH
                }
                ctx.strokeStyle = colors[i]
                ctx.stroke()
            }
        }
    }

    function drawXLabels(labels) {
        let xSpacing = (chartWidth - X_OFFSET) / labels.length
        for (let [index, label] of labels.entries()) {
            const dateAndMonth = getDateAndMonth(label)
            const xCalc = index * xSpacing
            const xPos = xCalc + X_OFFSET
            ctx.save()
            ctx.translate(xPos, chartHeight + 6)
            ctx.rotate((60 * Math.PI) / 180)
            ctx.font = '10px sans-serif'
            ctx.fillStyle = '#000000'
            ctx.fillText(dateAndMonth, 0, 0)
            ctx.restore()
        }
    }

    function getDateAndMonth(date) {
        return date
            .split('/')
            .slice(0, 2)
            .join('/')
    }

    function redrawChart() {
        canvas.width = docWidth
        canvas.height = docHeight
        drawCanvas(chartWidth, chartHeight)
        drawGraph(series)
        drawXLabels(xLabels)
    }

    $: {
        series.length > 0, xLabels.length > 0 && redrawChart()
    }

    $: {
        chartWidth = docWidth
        chartHeight = docHeight - 30
    }
</script>

<section bind:clientWidth={docWidth} bind:clientHeight={docHeight}>
    <canvas class="w-full" bind:this={canvas} />
</section>
