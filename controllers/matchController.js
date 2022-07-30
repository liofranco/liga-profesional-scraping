import * as cheerio from "cheerio";
import axios from "axios";

const matchData = async (req, res) => {
    let local = req.params.local;
    let visitante = req.params.visitante;
    let partidoId = req.params.partidoId;
    let year = req.params.year
    axios.get(`https://www.resultados-futbol.com/${partidoId}/${local}/${visitante}/${year}`)
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

            let estadisticas = []
            estadisticasData.each((i,el) => {
                const dato1 = $(el).find('td').first().text()
                const dato2 = $(el).find('td').last().text()
                const nombreDato = $(el).find('td h6').text()
                estadisticas.push({
                    nombreDato,
                    dato1,
                    dato2
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
                    nombre,
                    numero,
                    evtPlayer
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
                    nombre,
                    numero,
                    evtPlayer
                })
            })

            let golesDetalles = []

            goles.each((i, el) => {
                const golLocalJugador = $(el).find('.mhr-name').first().text()
                const golLocalTiempo = $(el).find('.mhr-min').first().text()
                const golVisitanteJugador = $(el).find('.mhr-name').last().text()
                const golVisitanteTiempo = $(el).find('.mhr-min').last().text()
                const resultadoParcial = $(el).find('.mhr-marker div').text()

                golesDetalles.push({
                    golLocalJugador,
                    golLocalTiempo,
                    golVisitanteJugador,
                    golVisitanteTiempo,
                    resultadoParcial
                })
            })

            

            let alineaciones = []
            let equipoLocal = []
            let equipoVisitante = []

            alineacionLocal.each((i,el) => {
                const clase = $(el).attr('class')
                const jugador = $(el).attr('title')
                const img = $(el).find('a img').attr('src')
                const num = $(el).find('.num').text()
                const eventos = $(el).find('.align-events span')
                let eventosPlayer = []
                if(eventos.length > 0){
                    eventos.each((i,el) => {
                        const evento = $(el).attr('class')
                        eventosPlayer.push({img: evento})
                    })
                }
                equipoLocal.push({
                    jugador,
                    img,
                    clase,
                    num,
                    eventos: eventosPlayer
                })})
            
            alineacionVisitante.each((i,el) => {
                const clase = $(el).attr('class')
                const jugador = $(el).attr('title')
                const img = $(el).find('a img').attr('src')
                const num = $(el).find('.num').text()
                const eventos = $(el).find('.align-events span')
                let eventosPlayer = []
                if(eventos.length > 0){
                    eventos.each((i,el) => {
                        const evento = $(el).attr('class')
                        eventosPlayer.push({img: evento})
                    })
                }
                equipoVisitante.push({
                    jugador,
                    img,
                    clase,
                    num,
                    eventos: eventosPlayer
                })})

            alineaciones.push(equipoLocal, equipoVisitante)

            let partido = {
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
            }

            res.send({
                status: "success",
                alineaciones,
                partido,
                supLocal,
                supVisitante,
                estadisticas
            })

        }).catch(err => console.error(err) );
}

export { matchData }