import Chart from '../src/components/chart.svelte'

export default {
    title: 'Chart',
    component: Chart,
}

export const Main = () => ({
    Component: Chart,
    props: {
        stopValuesAt: 5,
        colors: ['blue', 'green', 'red'],
        symbolToHighlight: null,
        series: [
            [5, 6, 7, 8, 9],
            [4, 9, 10, 8, 2],
            [3, 7, 9, 3, 6],
        ],
        xLabels: [
            '01/01/2020',
            '02/01/2020',
            '03/01/2020',
            '04/01/2020',
            '05/01/2020',
        ],
    },
})
