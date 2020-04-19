<script>
    import { beforeUpdate } from 'svelte'

    export let colors
    export let symbolToHighlight = null

    export let series
    export let xLabels
    export let ticks
    export let stopValuesAt = xLabels.length

    const X_OFFSET = 10
    const Y_OFFSET = 10
    const X_AXIS_OFFSET = 30
    const Y_AXIS_OFFSET = 50
    const CHART_TOP_PADDING = 10
    const Y_AXIS_SPACING = 2
    const X_AXIS_SPACING = 15

    let Y_AXIS_TICKS = ticks || 10

    let LINE_WIDTH = 2
    let AXIS_LINE_WIDTH = LINE_WIDTH / 4
    let BORDER_COLOR = '#718096'
    let CHART_BG_COLOR = '#fcfcfc'
    let NUMBER_OF_HORIZONTAL_SEGMENTS = 4

    let canvas
    let ctx

    let docHeight
    let docWidth

    let chartHeight
    let chartWidth

    beforeUpdate(() => {
        for (let x of timeoutList) {
            clearTimeout(x)
        }
    })

    function drawCanvas(newWidth, newHeight) {
        ctx = canvas.getContext('2d')

        ctx.beginPath()
        ctx.strokeStyle = 'transparent'
        ctx.fillStyle = CHART_BG_COLOR
        ctx.rect(
            X_AXIS_OFFSET,
            CHART_TOP_PADDING,
            newWidth,
            newHeight + CHART_TOP_PADDING
        )
        ctx.fillRect(
            X_AXIS_OFFSET,
            CHART_TOP_PADDING,
            newWidth,
            newHeight + CHART_TOP_PADDING
        )
        ctx.stroke()
    }

    async function drawGraph(
        chartWidth,
        chartHeight,
        valueSet,
        minYValue,
        maxYValue
    ) {
        for (const [i, item] of valueSet.entries()) {
            let yRange = maxYValue - minYValue
            let ySpacing = (chartHeight - Y_OFFSET) / yRange
            let xSpacing = (chartWidth - X_OFFSET) / (item.length - 1)
            let tempArr = new Array(stopValuesAt).fill()
            console.log('tempArr', tempArr)
            for (let [j] of tempArr.entries()) {
                const xCalc = j * xSpacing
                const xPos = xCalc + X_AXIS_OFFSET

                const yCalc = (item[j] - minYValue) * ySpacing
                const yPos =
                    chartHeight - yCalc - Y_OFFSET / 2 + CHART_TOP_PADDING

                const nextIndex = j + 1

                const xCalc2 = nextIndex * xSpacing
                const xPos2 = xCalc2 + X_AXIS_OFFSET

                const yCalc2 = (item[nextIndex] - minYValue) * ySpacing
                const yPos2 =
                    chartHeight - yCalc2 - Y_OFFSET / 2 + CHART_TOP_PADDING

                console.log('jSomething', j)
                ctx.beginPath()
                ctx.moveTo(xPos, yPos)
                ctx.lineTo(xPos2, yPos2)

                if (symbolToHighlight === i) {
                    ctx.lineWidth = 5
                } else {
                    ctx.lineWidth = LINE_WIDTH
                }
                ctx.strokeStyle = colors[i]
                ctx.stroke()

                let timeoutId = await wait(20)
                timeoutList.push(timeoutId)
            }
        }
    }

    let timeoutList = []

    const wait = async (ms = 500) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    const getLabelRotation = width => (width <= 1024 ? 90 : 60)

    function drawXLabels(chartWidth, chartHeight, labels) {
        let xSpacing = (chartWidth - X_OFFSET) / (labels.length - 1)
        const labelRotation = getLabelRotation(chartWidth)

        for (let [index, label] of labels.entries()) {
            const dateAndMonth = getDateAndMonthForLabel(label)
            const xPos = index * xSpacing
            ctx.save()
            ctx.translate(
                xPos + X_AXIS_OFFSET,
                chartHeight + CHART_TOP_PADDING + X_AXIS_SPACING
            )
            ctx.rotate((labelRotation * Math.PI) / 180)
            ctx.font = '10px sans-serif'
            ctx.fillStyle = '#000000'
            ctx.fillText(dateAndMonth, 0, 0)
            ctx.restore()
        }
    }

    function calculateYValue(maxY, steps, roundFunc) {
        const round = 10
        if (maxY < 2) return roundFunc(maxY)
        const roundedToTen = roundFunc(maxY / round) * round
        return roundFunc(roundedToTen / steps) * steps
    }

    function drawYLabels(chartHeight, min, max, steps) {
        let maxYValue = calculateYValue(max, steps, Math.ceil)
        let minYValue = calculateYValue(min, steps, Math.floor)

        let range = maxYValue - minYValue
        let yFrequency = range / (steps - 1)
        let ySpacing = (chartHeight + CHART_TOP_PADDING) / (steps - 1)

        for (let i = 0; i < steps; i++) {
            ctx.save()
            let yValue = Math.round(minYValue + i * yFrequency)
            let yPos = chartHeight - i * ySpacing

            ctx.translate(
                0,
                yPos + CHART_TOP_PADDING + X_OFFSET + Y_AXIS_SPACING
            )
            ctx.font = '10px sans-serif'
            ctx.fillStyle = '#000000'
            ctx.fillText(yValue, 0, 0)
            ctx.restore()
        }
    }

    function drawHorizontalLines(chartWidth, chartHeight, steps) {
        let ySpacing = (chartHeight + CHART_TOP_PADDING) / (steps - 1)

        for (let i = 0; i < steps - 1; i++) {
            let yPos = chartHeight - i * ySpacing
            ctx.beginPath()
            ctx.moveTo(0 + X_AXIS_OFFSET, yPos + CHART_TOP_PADDING + X_OFFSET)
            ctx.lineTo(
                chartWidth + X_AXIS_OFFSET,
                yPos + CHART_TOP_PADDING + X_OFFSET
            )

            if (i === 0) {
                ctx.lineWidth = LINE_WIDTH
            } else {
                ctx.lineWidth = AXIS_LINE_WIDTH
            }

            ctx.strokeStyle = BORDER_COLOR
            ctx.stroke()
        }
    }

    function getDateAndMonthForLabel(date) {
        return date
            .split('/')
            .slice(0, 2)
            .join('/')
    }

    function drawVerticalGridLines(chartWidth, chartHeight, lines) {
        let xSpacing = chartWidth / lines

        for (let i = 0; i < lines; i++) {
            let xPos = i * xSpacing

            ctx.beginPath()
            ctx.moveTo(xPos + X_AXIS_OFFSET, CHART_TOP_PADDING)
            ctx.lineTo(
                xPos + X_AXIS_OFFSET,
                chartHeight + CHART_TOP_PADDING + Y_OFFSET
            )

            if (i === 0) {
                ctx.lineWidth = LINE_WIDTH
            } else {
                ctx.lineWidth = AXIS_LINE_WIDTH
            }

            ctx.strokeStyle = BORDER_COLOR
            ctx.stroke()
        }
    }

    function redrawChart() {
        const allValues = series.flat()
        let minYValue = Math.min(...allValues)
        let maxYValue = Math.max(...allValues)

        canvas.width = docWidth
        canvas.height = docHeight

        drawCanvas(chartWidth, chartHeight)
        drawXLabels(chartWidth, chartHeight, xLabels)
        if (allValues.length > 0) {
            drawYLabels(chartHeight, minYValue, maxYValue, Y_AXIS_TICKS)
        }
        drawHorizontalLines(chartWidth, chartHeight, Y_AXIS_TICKS)
        drawVerticalGridLines(
            chartWidth,
            chartHeight,
            NUMBER_OF_HORIZONTAL_SEGMENTS
        )
        drawGraph(chartWidth, chartHeight, series, minYValue, maxYValue)
    }

    $: {
        series.length > 0,
            xLabels.length > 0 && chartWidth && chartHeight && redrawChart()
    }

    $: {
        chartWidth = docWidth - X_AXIS_OFFSET
        chartHeight = docHeight - Y_AXIS_OFFSET - CHART_TOP_PADDING
    }
</script>

<section
    bind:clientWidth={docWidth}
    style={`max-height: 100vh; height: auto;`}
    bind:clientHeight={docHeight}>
    <canvas class="w-full" bind:this={canvas} />
</section>
