import * as sapper from '@sapper/app'
import { ga } from './utils/ga.utils'

sapper.start({
    target: document.querySelector('#sapper'),
})

if (process.env.TRACKING_ID && process.env.NODE_ENV === 'production')
    ga(process.env.TRACKING_ID)
