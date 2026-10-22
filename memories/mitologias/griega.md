# Mitología griega

Datos en `src/content/mitologias/griega/`: `mitologia.yaml` (salas y categorías) y `seres/*.md` (**313 seres**).
Canon: **Teogonía de Hesíodo** (c. 700 a. C.), completa del verso 1 al 1022.

## Fuentes
- Texto griego y traducción inglesa de H. G. Evelyn-White (1914, dominio público), en Perseus:
  https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0130
- Las citas en español son **traducción propia** (no se copian traducciones con derechos de autor).
- Nombres griegos en la forma jónica de Hesíodo (Ῥείη, Ἥρη, Ἠέλιος), no la ática.
- Transliteración: generada automáticamente con macrones en η → ē y ω → ō, `h` por espíritu áspero,
  sin acentos (Rheiē, Hērē, Ōkeanos). Si se corrige a mano, mantener ese criterio.

## Criterio de orden (decidido con el usuario el 2026-10-22)
`orden` = verso donde **se narra el nacimiento u origen** del ser; si el poema no lo narra, el verso de su
**primera mención**. Decimales para desempatar seres del mismo verso, en el orden en que se nombran
(77, 77.1, 77.2...). Para insertar un ser entre dos existentes, usar un decimal intermedio (p. ej. 457.05).

Consecuencias aceptadas:
- Poseidón (mencionado en el v. 278) y Heracles (v. 289) se ordenan por su nacimiento (456 y 943).
- Doris, Electra y Calírroe aparecen como madres antes del catálogo de las Oceánides, pero se ordenan en ese catálogo (349-361).
- Dioniso (nace en el v. 940) va antes que su madre Sémele (nace en el v. 976). Es el orden del poema.
- Las nueve Musas abren el recorrido en la sala del **proemio** (vv. 77-79, donde se nombran). Los demás dioses
  que el himno inicial menciona (Zeus, Hera, Atenea...) NO se ordenan por el proemio.

## Alcance (decidido con el usuario)
- **Todos** los seres nombrados en la Teogonía, incluidos uno por uno los de las listas: 51 Nereidas,
  41 Oceánides y 25 ríos. Los grupos sin nombres individuales (Erinias, Gigantes, Melias, Hespérides,
  Keres, Oniros, los hijos plurales de Eris...) son un único ser con `colectivo: true`.
- Mortales y héroes que el poema nombra (Perseo, Cadmo, Jasón, Odiseo...) se incluyen con categoría `mortal`.
- Seres de otras fuentes (Homero, Apolodoro, himnos) **no** entran. Ampliación futura.

## Salas y recuento (rango de versos → sala, según `orden`)
| Sala | Versos | Seres |
|---|---|---|
| proemio | 1-115 | 9 (Musas) |
| primordiales | 116-125 | 8 |
| hijos-de-gea | 126-153 | 21 |
| castracion | 154-210 | 5 |
| hijos-de-nix | 211-232 | 32 |
| linaje-del-mar | 233-336 | 80 |
| hijos-de-titanes | 337-452 | 84 |
| olimpicos | 453-506 | 6 |
| prometeo | 507-616 | 6 |
| titanomaquia | 617-880 | 3 |
| reinado-de-zeus | 881-1022 | 59 |

Si un ser nuevo tiene un `orden` fuera del rango de su `sala`, nada lo impide en el código: hay que poner la sala correcta a mano.

## Categorías (recuento)
ninfa 95 · deidad 67 · mortal 39 · personificacion 35 · titan 24 · monstruo 17 · olimpico 14 ·
primordial 11 · raza 7 · criatura 4.
- `titan` incluye a la segunda generación titánica (Helios, Atlas, Prometeo, Leto...).
- `olimpico` incluye a los seis hijos de Crono (Hades también) y a Afrodita, Apolo, Ártemis, Atenea, Ares, Hefesto, Hermes y Dioniso.

## Nombres repetidos (slug distinto)
| Nombre | Slugs |
|---|---|
| Tetis | `tetis` (titánide, Τηθύς) · `tetis-nereida` (madre de Aquiles, Θέτις) |
| Doris | `doris` (oceánide, madre) · `doris-nereida` |
| Érato | `erato` (Musa) · `erato-nereida` |
| Urania | `urania` (Musa) · `urania-oceanide` |
| Talía | `talia` (Musa) · `talia-carite` |
| Toe | `toe` (nereida) · `toe-oceanide` |
| Eudora | `eudora` (nereida) · `eudora-oceanide` |
| Ágave | `agave` (nereida) · `agave-cadmea` |
| Autónoe | `autonoe` (nereida) · `autonoe-cadmea` |
| Neso | `neso` (nereida) · `neso-rio` |
| Pluto | `pluto` (riqueza, hijo de Deméter) · `pluto-oceanide` |
| Ladón | `ladon` (río) · `serpiente-hesperides` (la serpiente, sin nombre en Hesíodo) |

## Pasajes ambiguos y decisiones
- **Equidna** (v. 295): su madre puede ser Ceto o Calírroe. Se usa Ceto y se explica en `origen`.
- **Quimera** (v. 319): hija de Equidna o de la Hidra. Se usa Equidna.
- **Fix (Esfinge) y León de Nemea** (vv. 326-327): hijos de Orto y de la Quimera (o de Equidna). Se usa la Quimera.
- **Moiras**: doble genealogía, hijas de Nix (v. 217) o de Zeus y Temis (v. 904). Padres = Nix; el v. 904 va en `otrasFuentes`.
- **Nereidas**: Hesíodo dice cincuenta pero nombra cincuenta y una. Se incluyen todas.
- **Pandora**: no recibe nombre en la Teogonía; se toma de *Trabajos y días* v. 81 (en `otrasFuentes`).
- **Telégono** (v. 1014): verso considerado interpolado; se incluye con una nota.
- **Cerbero**: Hesíodo le da cincuenta cabezas; las obras conocidas lo muestran con tres.
- **Dione**: en Hesíodo es una oceánide, no la madre de Afrodita.
- **Faetón** (v. 987): hijo de Eos y Céfalo, no el hijo de Helios.
- **Hímero** y el **Águila** no tienen padres en el poema: se usa `origen`.
- **Quirón**: el poema lo llama hijo de Fílira, que no tiene ficha propia.

## Cómo se generaron los datos (2026-10-22)
Los 313 `.md` se crearon con un generador temporal a partir de tablas, que ya no existe.
**Los `.md` son ahora la única fuente de verdad**: se editan a mano y no se regeneran.
Formato del frontmatter: claves YAML con valores entre comillas dobles (JSON válido) y listas `[...]`.
