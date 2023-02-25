import * as cheerio from "cheerio";
import axios from "axios";
import { teams } from "../teams.js";

const matchData = async (req, res) => {
    let local = req.params.local;
    let visitante = req.params.visitante;
    let partidoId = req.params.partidoId;
    /* let year = req.params.year */
    axios.get(`https://www.resultados-futbol.com/${partidoId}/${local}/${visitante}`)
        .then((response) => {
            const $ = cheerio.load(response.data)
            const alineacionLocal = $('.alineaciones .campo1 .local #dreamteam1')
            const alineacionVisitante = $('.alineaciones .campo1 .visitante #dreamteam2')
            const local = $('.performers .equipo1 h2 a b').text()
            const visitante = $('.performers .equipo2 h2 a b').text()
            const localEscudo = $('.performers .divfieldm .header-team-1 .header-team .team-logo img').attr('src')
            const visitanteEscudo = $('.performers .divfieldm .header-team-2 .header-team .team-logo img').attr('src')
            const date = $('.performers .jor-date').attr('content')
            const golLocal = $('.performers .resultado .claseR').first().text()
            const golVisitante = $('.performers .resultado .claseR').last().text()
            const goles = $('.match-header-resume table tbody tr')
            const tiempo = $('.marcador-header .jor-status').text().toLowerCase()
            const fecha = $('.marcador-header .jor-fecha .jornada a').text()
            const suplentesLocalContainer = $('#tab_match_teams .team1 .aligns-list-container .aligns-list').last()
            const suplentesLocal = suplentesLocalContainer.find('li')
            const suplentesVisitanteContainer = $('#tab_match_teams .team2 .aligns-list-container .aligns-list').last()
            const suplentesVisitante = suplentesVisitanteContainer.find('li')
            const estadisticasData = $('#box-tabla .contentitem table tbody tr')
            const teamHome = teams.find(t => t.name === local)
            const teamAway = teams.find(t => t.name === visitante)

            let statistics = []
            estadisticasData.each((i,el) => {
                const home = $(el).find('td').first().text()
                const away = $(el).find('td').last().text()
                const type = $(el).find('td h6').text()
                statistics.push({
                    type,
                    home,
                    away
                }) 
            })

            const supLocal = []
            const supVisitante = [] 

            suplentesLocal.each((i,el) => {
                const numero = $(el).find('.align-dorsal').text()
                const nombre = $(el).find('.align-player').text()
                const eventos = $(el).find('.align-events span')
                const evtPlayer = []
                eventos.each((i,el) => {
                    const evento = $(el).attr('class')
                    const evtTiempo = $(el).find('b').text()
                    evtPlayer.push({
                        img: evento,
                        tiempo: evtTiempo
                    })
                })
                supLocal.push({
                    player:nombre,
                    number: numero,
                    events: evtPlayer
                })
            })

            suplentesVisitante.each((i,el) => {
                const numero = $(el).find('.align-dorsal').text()
                const nombre = $(el).find('.align-player').text()
                const eventos = $(el).find('.align-events span')
                const evtPlayer = []
                eventos.each((i,el) => {
                    const evento = $(el).attr('class')
                    const evtTiempo = $(el).find('b').text()
                    evtPlayer.push({
                        img: evento,
                        tiempo: evtTiempo
                    })
                })
                supVisitante.push({
                    player:nombre,
                    number: numero,
                    events: evtPlayer
                })
            })

            let golesDetalles = []

            goles.each((i, el) => {
                const golLocalJugador = $(el).find('.mhr-name').first().text()
                const golLocalTiempo = $(el).find('.mhr-min').first().text()
                const golVisitanteJugador = $(el).find('.mhr-name').last().text()
                const golVisitanteTiempo = $(el).find('.mhr-min').last().text()
                const score = $(el).find('.mhr-marker div').text()

                golesDetalles.push({
                    home: {
                        player: golLocalJugador,
                        time: golLocalTiempo
                    },
                    away: {
                        player: golVisitanteJugador,
                        time: golVisitanteTiempo
                    },
                    score
                })
            })

            

            let alineaciones = []
            let equipoLocal = []
            let equipoVisitante = []

            alineacionLocal.each((i,el) => {
                const grid = $(el).attr('class')
                const player = $(el).attr('title')
                const img = $(el).find('a img').attr('src').slice(0,-11)
                const number = $(el).find('.num').text()
                const background = $(el).find('.num').attr('style').slice(17)
                const events = $(el).find('.align-events span')
                let eventosPlayer = []
                if(events.length > 0){
                    events.each((i,el) => {
                        const evento = $(el).attr('class')
                        eventosPlayer.push({img: evento})
                    })
                }
                equipoLocal.push({
                    player,
                    img,
                    grid,
                    number,
                    background,
                    events: eventosPlayer
                })})
            
            alineacionVisitante.each((i,el) => {
                const grid = $(el).attr('class')
                const player = $(el).attr('title')
                const img = $(el).find('a img').attr('src').slice(0,-11)
                const number = $(el).find('.num').text()
                const background = $(el).find('.num').attr('style').slice(17)
                const events = $(el).find('.align-events span')
                let eventosPlayer = []
                if(events.length > 0){
                    events.each((i,el) => {
                        const evento = $(el).attr('class')
                        eventosPlayer.push({img: evento})
                    })
                }
                equipoVisitante.push({
                    player,
                    img,
                    grid,
                    number,
                    background,
                    events: eventosPlayer
                })})

            alineaciones.push(equipoLocal, equipoVisitante)

            /* let partido = {
                local: local,
                visitante: visitante,
                localEscudo: localEscudo,
                visitanteEscudo: visitanteEscudo,
                golLocal: golLocal,
                golVisitante: golVisitante,
                idPartido: `${local}-${visitante}`,
                date: date,
                golesDetalles: golesDetalles,
                tiempo: tiempo,
                fecha: fecha.slice(8)
            } */

            let partido = {
                id: `23${fecha.slice(8)}${teamHome.id}${teamAway.id}`,
                date: date,
                round: fecha.slice(8),
                status: tiempo,
                teams: {
                    home: {
                        id: teamHome.id,
                        name: local,
                        code: teamHome.code,
                        logo: localEscudo
                    },
                    away: {
                        id: teamAway.id,
                        name: visitante,
                        code: teamAway.code,
                        logo: visitanteEscudo                       
                    }
                },
                goals:{
                    home: golLocal,
                    away: golVisitante
                },
                stadium: teamHome.stadium,
                events: golesDetalles
            }

            res.send({
                status: "success",
                partido,
                lineups: {
                    home: {
                        initial: equipoLocal,
                        substitutes: supLocal
                    },
                    away: {
                        initial: equipoVisitante,
                        substitutes: supVisitante
                    }
                },
                statistics
            })

        }).catch(err => console.error(err) );
}

export { matchData }