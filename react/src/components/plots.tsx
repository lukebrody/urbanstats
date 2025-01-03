import React, { ReactNode } from 'react'

import { ExtraStat } from './load-article'
import { Histogram } from './plots-histogram'
import { TimeSeriesPlot } from './plots-timeseries'

interface PlotProps {
    shortname: string
    extra_stat?: ExtraStat
    color: string
}

export function WithPlot(props: { children: React.ReactNode, plot_props: PlotProps[], expanded: boolean }): ReactNode {
    return (
        <div className="plot">
            {props.children}
            {props.expanded ? <RenderedPlot plot_props={props.plot_props} /> : null}
        </div>
    )
}

function RenderedPlot({ plot_props }: { plot_props: PlotProps[] }): ReactNode {
    const type = plot_props.reduce<undefined | 'histogram' | 'time_series'>((result, plot) => {
        if (result === undefined) {
            return plot.extra_stat?.type
        }
        else if (plot.extra_stat?.type !== undefined && plot.extra_stat.type !== result) {
            throw new Error('Rendering plots of differing types')
        }
        return result
    }, undefined)
    switch (type) {
        case 'histogram':
            return (
                <Histogram
                    histograms={plot_props.flatMap(
                        (props) => {
                            if (props.extra_stat?.type !== 'histogram') {
                                return []
                            }
                            return [
                                {
                                    shortname: props.shortname,
                                    histogram: props.extra_stat,
                                    color: props.color,
                                    universe_total: props.extra_stat.universe_total,
                                },
                            ]
                        },
                    )}
                />
            )
        case 'time_series':
            return (
                <TimeSeriesPlot
                    stats={plot_props.map(
                        (props) => {
                            if (props.extra_stat?.type !== 'time_series') {
                                throw new Error('expected time_series')
                            }
                            return {
                                shortname: props.shortname,
                                stat: props.extra_stat,
                                color: props.color,
                            }
                        },
                    )}
                />
            )
        case undefined:
            return null
    }
}
