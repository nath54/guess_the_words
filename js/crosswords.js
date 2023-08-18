var words_keys = Object.keys(data_words);
var now = words_keys.length - 1;

var words_done = {};

const dim_x = 30;
const dim_y = 30;

var grille = [];

var alphabet = "abcdefghijklmnopqrstuvwxyz";

function randint(a, b) {
    return a + parseInt(Math.random() * (b - a));
}

function rchoice(lst) {
    return lst[randint(0, lst.length - 1)];
}

function get_random_word() {
    var a = randint(0, now);
    while (a in words_done && data_words[words_keys[a]].startsWith("See ") && data_words[words_keys[a]].endsWith("-") && data_words[words_keys[a]].contains(" ")) {
        a = (a + 1) % now;
    }
    return a;
}

window.word_guess = null;

/*
Constraints = dict {
    "size": int,  (= Precise length of a word)
    "max_size": int,  (= Max length of a word)
    "attachement": bool,  (=If activate the attachment constraint, that consists to find a word that can attach)
    "attachement_x": int,  (= x coordinate of the attachement constraint)
    "attachement_y": int,  (= y coordinate of the attachement constraint)
}

*/
function find_word_with_constraints(constraints, max_trys = 100) {
    //
    var sens = -1; // 1 = horizontal, 2 = vertical, 3 = both horizontal & vertical
    var l = "";
    var atx = -1;
    var aty = -1;
    // Attachement constraint preparation
    if (constraints["attachement"] != undefined && constraints["attachement"] && constraints["attachement_x"] != undefined && constraints["attachement_y"] != undefined) {
        atx = constraints["attachement_x"];
        aty = constraints["attachement_y"];
        //
        l = grille[aty][atx];
        // Detection du sens dans le mot va essayer d'être placé
        if ((aty + 1 < dim_y && grille[aty + 1][atx] != "") || (aty - 1 >= 0 && grille[aty - 1][atx] != "")) {
            sens = 1;
        } else if ((atx + 1 < dim_x && grille[aty][atx + 1] != "") || (atx - 1 >= 0 && grille[aty][atx - 1] != "")) {
            sens = 2;
        } else {
            sens = -1;
        }
        //
        if (l == "" || sens == -1) {
            return null;
        }
    }
    //
    var trys = 0;
    //
    while (trys < max_trys) {
        trys += 1;
        var w = get_random_word();
        var iw = get_random_word();
        var w = words_keys[iw];
        var taille_mot = w.length;
        var bon = true;
        var pos = []; // Contient une liste d'index de lettres

        // Test des contraintes 

        // Size constraint
        if ("size" in constraints) {
            if (taille_mot != constraints["size"]) {
                bon = false;
            }
        }
        // Max Size constraint
        if ("max_size" in constraints) {
            if (taille_mot > constraints["max_size"]) {
                bon = false;
            }
        }
        // Attachement constraint
        if (constraints["attachement"] != undefined && constraints["attachement"] && constraints["attachement_x"] != undefined && constraints["attachement_y"] != undefined) {

            // Recherche de la lettre l dans le mot que l'on essaie de placer
            //
            for (j = 0; j < taille_mot; j++) {
                if (w[j] == l) {
                    // test de placement du mot
                    var bon2 = true;
                    // Debut du mot
                    var dbx = -1;
                    var dby = -1;
                    if (sens == 1) {
                        dbx = atx - j;
                        dby = aty;
                    } else {
                        dbx = atx;
                        dby = aty - j;
                    }
                    // On teste si le mot rentre dans la grille déjà
                    if (!dbx || !dby || dbx <= 0 || dby <= 0 ||
                        (sens == 1 && dbx + taille_mot + 2 >= dim_x) ||
                        (sens == 2 && dby + taille_mot + 2 >= dim_y) ||
                        (sens == 1 && grille[dby][dbx - 1] != "") ||
                        (sens == 1 && grille[dby][dbx + taille_mot + 1] != "") ||
                        (sens == 2 && grille[dby - 1][dbx] != "") ||
                        (sens == 2 && grille[dby + taille_mot + 1][dbx] != "")

                    ) {
                        bon2 = false;
                    } else {
                        // On va tester les collisions pour chaque lettre
                        for (k = -1; k <= taille_mot; k++) {
                            if (sens == 1) {
                                if (k != j) {
                                    if (grille[dby - 1][dbx + k] != "" || grille[dby + 1][dbx + k] != "") {
                                        bon2 = false;
                                    }
                                }
                                if (grille[dby][dbx + k] != "" && grille[dby][dbx + k] != w[k]) {
                                    bon2 = false;
                                }
                            } else {
                                if (k != j) {
                                    if (grille[dby + k][dbx - 1] != "" || grille[dby + k][dbx + 1] != "") {
                                        bon2 = false;
                                    }
                                }
                                if (grille[dby + k][dbx] != "" && grille[dby + k][dbx] != w[k]) {
                                    bon2 = false;
                                }
                            }
                        }
                    }
                    //
                    if (bon2) {
                        pos.push(j);
                    }
                }
            }
            //
            if (pos == [] || pos.length <= 0) {
                bon = false;
            }

        }

        if (bon) {
            if (constraints["attachement"] != undefined && constraints["attachement"] && constraints["attachement_x"] != undefined && constraints["attachement_y"] != undefined) {
                var index_placement = rchoice(pos);
                var pos_x = -1;
                var pos_y = -1;
                if (sens == 1) {
                    pos_x = atx - index_placement;
                    pos_y = aty;
                } else {
                    pos_x = atx;
                    pos_y = aty - index_placement;
                }
                return {
                    "word_index": iw,
                    "word": w,
                    "sens": sens,
                    "index_placement": index_placement,
                    "pos_x": pos_x,
                    "pos_y": pos_y
                }
            } else {
                return {
                    "word_index": iw,
                    "word": w
                }
            }
        }
    }
    return null;
}

function main_generation() {
    // Nettoyage de la grille
    grille = [];
    for (y = 0; y < dim_y; y++) {
        grille.push([]);
        for (x = 0; x < dim_x; x++) {
            grille[y].push("");
        }
    }
    //
    var words = []; // Contient un dictionnaire {"index_mot": int, "mot": String, "pos_x": int, "pos_y": int, "sens": int}
    //
    // Tirage du premier mot
    var sens = randint(1, 2);
    if (sens == 1) {
        var res = find_word_with_constraints({ "max_size": dim_x - 3 });
        if (res != null) {
            var pos_x = randint(0, dim_x - res["word"].length - 1);
            var pos_y = randint(0, dim_y - 1);
            //
            for (j = 0; j < res["word"].length; j++) {
                grille[pos_y][pos_x + j] = res["word"][j];
            }
            //
            words.push({ "word_index": res["word_index"], "word": res["word"], "pos_x": pos_x, "pos_y": pos_y, "sens": sens });
        } else {
            console.error("Error during first word tirage!");
            return;
        }
    } else {
        var res = find_word_with_constraints({ "max_size": dim_y - 3 });
        if (res != null) {
            var pos_y = randint(0, dim_y - res["word"].length - 1);
            var pos_x = randint(0, dim_x - 1);
            //
            for (j = 0; j < res["word"].length; j++) {
                grille[pos_y + j][pos_x] = res["word"][j];
            }
            //
            words.push({ "word_index": res["word_index"], "word": res["word"], "pos_x": pos_x, "pos_y": pos_y, "sens": sens });
        } else {
            console.error("Error during first word tirage!");
            return null;
        }

    }
    //
    // Tirages des prochains mots
    // Tant que l'on arrive à tirer des mots
    const max_trys = 1500;
    var trys = 0;
    while (trys < max_trys) {
        trys += 1;
        // On va choisir un mot aléatoire déjà tiré, et choisir une lettre d'attache
        var rw = rchoice(Object.keys(words));
        var k = randint(0, words[rw]["word"].length);
        var atx = -1;
        var aty = -1;
        var max_size = -1;
        var sens = -1;
        //
        if (words[rw]["sens"] == 1) {
            atx = words[rw]["pos_x"] + k;
            aty = words[rw]["pos_y"];
            max_size = dim_y - 3;
            sens = 2;
        } else {
            atx = words[rw]["pos_x"];
            aty = words[rw]["pos_y"] + k;
            max_size = dim_x - 3;
            sens = 1;
        }
        //
        var res = find_word_with_constraints({
            "max_size": max_size,
            "attachement": true,
            "attachement_x": atx,
            "attachement_y": aty
        });
        //
        if (res != null) {
            if (sens == 1) {
                var pos_x = res["pos_x"];
                var pos_y = res["pos_y"];
                //
                for (j = 0; j < res["word"].length; j++) {
                    grille[pos_y][pos_x + j] = res["word"][j];
                }
                //
                words.push({ "word_index": res["word_index"], "word": res["word"], "pos_x": pos_x, "pos_y": pos_y, "sens": sens });
            } else {
                var pos_x = res["pos_x"];
                var pos_y = res["pos_y"];
                //
                for (j = 0; j < res["word"].length; j++) {
                    grille[pos_y + j][pos_x] = res["word"][j];
                }
                //
                words.push({ "word_index": res["word_index"], "word": res["word"], "pos_x": pos_x, "pos_y": pos_y, "sens": sens });

            }
        }
    }
    //
    return { "words": words, "grille": grille };
}

function aff1(grille, words) {
    var ty = grille.length;
    var tx = grille[0].length;
    //
    var table = document.getElementById("crossword_table");
    // Nettoyage
    for (c of table.children) {
        table.removeChild(c);
    }
    // Creation de la grille vide && Placement des cases
    for (y = 0; y < ty; y++) {
        //
        var row = document.createElement("tr");
        row.setAttribute("id", "row_" + y);
        table.appendChild(row);
        //
        for (x = 0; x < tx; x++) {
            var cell = document.createElement("td");
            cell.setAttribute("id", "cell_" + y + "_" + x);
            row.appendChild(cell);
            if (grille[y][x] == "") {
                // var div = document.createElement("div");
                // cell.appendChild(div);
            } else {
                // var span = document.createElement("span");
                // span.innerText = grille[y][x];
                // cell.appendChild(span);
            }
        }
    }
    // Ajout des cases mots / définitions
    for (w of words) {
        console.log(w);
        var wpx = w["pos_x"];
        var wpy = w["pos_y"];
        var dx;
        var dy;
        if (w["sens"] == 1) {
            dx = 1;
            dy = 0;
        } else if (w["sens"] == 2) {
            dx = 0;
            dy = 1;
        }
        //
        var cell = document.getElementById("cell_" + (wpx - dx) + "_" + (wpy - dy));
        // Verification
        for (k = 0; k < w["word"].length; k++) {
            if (document.getElementById("cell_" + (wpx + k * dx) + "_" + (wpy + k * dy)).children.length != 0) {
                if (document.getElementById("cell_" + (wpx + k * dx) + "_" + (wpy + k * dy)).children[0].innerText != w["word"][k]) {
                    continue;
                }
            }
        }
        // Select word
        if (cell.children.length == 0) {
            var d = document.createElement("div");
            d.classList.add("bt_select_word");
            d.setAttribute("onclick", "select_word(" + w["sens"] + ", " + w["pos_x"] + ", " + w["pos_y"] + ", \"" + w["word"].replaceAll("\"", "'") + "\", \"" + data_words[w["word"]].replaceAll("\"", "'") + "\")");
            cell.appendChild(d);
        }
        // Draw letters
        for (k = 0; k < w["word"].length; k++) {
            if (document.getElementById("cell_" + (wpx + k * dx) + "_" + (wpy + k * dy)).children.length == 0) {
                var letter = document.createElement("span");
                if (w["word"][k])
                //letter.innerText = w["word"][k];
                    document.getElementById("cell_" + (wpx + k * dx) + "_" + (wpy + k * dy)).appendChild(letter);
            }
        }
    }
    // Blank unactive cells
    for (x = 0; x < dim_x; x++) {
        for (y = 0; y < dim_y; y++) {
            var cell = document.getElementById("cell_" + x + "_" + y);
            if (cell.children.length == 0) {
                cell.classList.add("empty_cell");
            }
        }
    }
}

function select_word(sens, pos_x, pos_y, word, definition) {
    // Clean previous selected cells
    for (x = 0; x < 5; x++) {
        for (c of document.getElementsByClassName("selected_cell")) {
            c.classList.remove("selected_cell");
        }
    }
    // Select cells
    for (k = 0; k < word.length; k++) {
        if (sens == 1) {
            document.getElementById("cell_" + (pos_x + k) + "_" + pos_y).classList.add("selected_cell");
        } else if (sens == 2) {
            document.getElementById("cell_" + pos_x + "_" + (pos_y + k)).classList.add("selected_cell");
        }
    }
    // Show definition 
    document.getElementById("word_definition").innerText = definition;
    //
    window.word_guess = {
        "sens": sens,
        "pos_x": pos_x,
        "pos_y": pos_y,
        "word": word,
        "definition": definition
    };
    // Word Guess
    document.getElementById("guess_result").innerText = "";
    var div_g = document.getElementById("guess_word");
    var prev_inp = null;
    // Cleaning
    div_g.innerHTML = "";
    window.inp_datas = {};
    //
    for (k = 0; k < word.length; k++) {
        var guessed = false;
        if (sens == 1) {
            guessed = document.getElementById("cell_" + (pos_x + k) + "_" + pos_y).classList.contains("guessed");
        } else if (sens == 2) {
            guessed = document.getElementById("cell_" + pos_x + "_" + (pos_y + k)).classList.contains("guessed");
        }
        //
        if (guessed) {
            var span = document.createElement("span");
            span.innerText = word[k];
            span.id = "inp_lettre_" + k;
            div_g.appendChild(span);
        } else {
            var inp = document.createElement("input");
            inp.maxLength = 1;
            inp.id = "inp_lettre_" + k;
            //
            if (prev_inp != null) {
                if (Object.keys(window.inp_datas).includes(prev_inp.id)) {
                    window.inp_datas[prev_inp.id]["next_input"] = inp.id;
                } else {
                    window.inp_datas[prev_inp.id] = {
                        "next_input": inp.id
                    };
                }
                window.inp_datas[inp.id] = {
                    "previous_input": prev_inp.id
                };
            }
            //
            inp.addEventListener("keyup", (event) => {
                console.log("TEST ! - inp id : ", inp.id, " - event target id : ", event.target.id);
                if (event.isComposing || event.keyCode === 229) {
                    return;
                } else if (event.key == "Backspace") {
                    console.log("back!");
                    if (window.inp_datas[event.target.id] != undefined && document.getElementById(window.inp_datas[event.target.id]["previous_input"]) != undefined) {
                        document.getElementById(window.inp_datas[event.target.id]["previous_input"]).focus();
                    }
                } else {
                    console.log("next!");
                    if (window.inp_datas[event.target.id] != undefined && document.getElementById(window.inp_datas[event.target.id]["next_input"]) != undefined) {
                        document.getElementById(window.inp_datas[event.target.id]["next_input"]).focus();
                    }
                }
            });
            //
            prev_inp = inp;
            div_g.appendChild(inp);
        }

    }
}

function keydown_next_focus(prev_inp, next_inp) {

}

function validate_word_guess() {
    var rword = window.word_guess["word"];
    var guess = "";
    for (k = 0; k < rword.length; k++) {
        var el = document.getElementById("inp_lettre_" + k);
        if (el.nodeName == "INPUT") {
            guess += el.value;
        } else {
            guess += el.innerText;
        }
    }

    if (guess.toLowerCase() == rword.toLowerCase()) {
        document.getElementById("guess_result").innerText = "Good guess !";
        document.getElementById("guess_result").style.color = "green";
        //
        for (k = 0; k < rword.length; k++) {
            var cpx;
            var cpy;
            if (window.word_guess["sens"] == 1) {
                cpx = window.word_guess["pos_x"] + k;
                cpy = window.word_guess["pos_y"];
            } else {
                cpy = window.word_guess["pos_y"] + k;
                cpx = window.word_guess["pos_x"];
            }
            //
            var cell = document.getElementById("cell_" + cpx + "_" + cpy);
            if (!cell.classList.contains("guessed")) {
                var letter = document.createElement("span");
                letter.innerText = rword[k];
                cell.appendChild(letter);
                cell.classList.add("guessed");
            }
        }
        //
    } else {
        document.getElementById("guess_result").innerText = "Bad guess !";
        document.getElementById("guess_result").style.color = "red";
    }

}

//

function generate_and_aff() {
    try {
        var result = main_generation();
        if (result && result["words"].length > 5) {
            aff1(result["grille"], result["words"]);
        } else {
            generate_and_aff();
        }
    } catch {
        generate_and_aff();
    }
}

generate_and_aff();

document.getElementById("bug").style.display = "none";
document.getElementById("correct").style.display = "initial";