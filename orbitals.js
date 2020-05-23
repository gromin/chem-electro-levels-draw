const orbitals = (function() {
    const boxes = { s: 1, p: 3, d: 5, f: 7 };
    const offsets = { s: 0, p: 2, d: 4, f: 6 };

    function parse(s) {
        const sublevelsCount = (l, type) => {
            if (l === 1) {
                return 1;
            } else if (l === 2) {
                return 2;
            } else if (l === 3) {
                return 3;
            } else if (type === "grid2" && l === 7) {
                return 3;
            } else if (type === "grid2" && l === 8) {
                return 2;
            } else if (type === "grid2" && l === 9) {
                return 1;
            } else {
                return 4;
            }
        };
        const size = (sl) => {
            if (sl === "s") {
                return 1;
            } else if (sl === "p") {
                return 3;
            } else if (sl === "d") {
                return 5;
            } else if (sl === "f") {
                return 7;
            }
        };

        const structure = {};
        let type = "grid1";

        let leftover = s.replace(/\s+/gm, "");

        if (leftover.match(/^\#grid2\#/)) {
            leftover = leftover.replace(/^\#grid2\#/, "");
            type = "grid2";
        } else {
            leftover = leftover.replace(/^\#grid1\#/, "");
        }

        const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const sublevels = ["s", "p", "d", "f"];

        for (let l = 1; l <= (type === "grid1" ? 8 : 9); l++) {
            if (leftover === "") break;
            for (let j = 0; j < sublevelsCount(l, type); j++) {
                if (leftover === "") break;
                const sl = sublevels[j];
                const regexp = new RegExp(`${l}${sl}(\\(([\\d,]*)\\))?`, "mi");
                const match = leftover.match(regexp);
                if (match) {
                    leftover = leftover.replace(regexp, "");
                    structure[l] = structure[l] || {};
                    structure[l][sl] = [];
                    const [m1, m2, m3] = match;
                    if (m3) {
                        structure[l][sl] = m3
                            .split(",")
                            .map((x) => parseInt(x, 10) || 0)
                            .slice(0, size(sl));
                    }
                }
            }
        }

        return { structure, type };
    }

    function sublevelsSize(sublevels) {
        return sublevels["f"]
            ? 4
            : sublevels["d"]
            ? 3
            : sublevels["p"]
            ? 2
            : sublevels["s"]
            ? 1
            : 0;
    }

    function numToArrows(num) {
        if (num === 1) return "↑";
        if (num === 2) return "↑↓";
        return "&nbsp;";
    }

    function genTable(trs, sublevel, fullBorder) {
        const table = document.createElement("table");
        const styles = ["display: inline-table", "margin: 0 4px"];
        if (fullBorder) {
            styles.push("border-collapse: collapse");
        }
        if (sublevel) {
            styles.push(...["position: relative", `top: -${offsets[sublevel] || 0}em`]);
        }

        table.style = styles.join("; ");
        trs.forEach((tr) => table.appendChild(tr));
        return table;
    }

    function genTr(tds) {
        const tr = document.createElement("tr");
        tds.forEach((td) => tr.appendChild(td));
        return tr;
    }

    function genTd(text, border, fullBorder, colspan) {
        const td = document.createElement("td");
        td.innerHTML = text;
        if (colspan && colspan !== 1) {
            td.colSpan = colspan;
        }

        let styles = ["min-width: 2em", "height: 2em", "text-align: center"];
        if (border) {
            styles = styles.concat(
                fullBorder ? ["border: 1px solid"] : ["border-bottom: 1px solid"]
            );
        }
        td.style = styles.join("; ");
        return td;
    }

    function genLevel(structure, level, fullBorder) {
        const sublevels = structure[level];
        if (!sublevels) return;
        const size = sublevelsSize(sublevels);
        const wrapper = document.createElement("div");
        wrapper.style = "white-space: nowrap;";
        ["s", "p", "d", "f"].slice(0, size).forEach((sublevel) => {
            const values = sublevels[sublevel];
            const title = genTd(`${level}${sublevel}`, false, fullBorder, boxes[sublevel]);
            const orbitals = [];
            for (let i = 0; i < boxes[sublevel]; i++) {
                orbitals.push(genTd(numToArrows((values && values[i]) || 0), true, fullBorder));
            }
            wrapper.appendChild(genTable([genTr(orbitals), genTr([title])], sublevel, fullBorder));
        });
        return wrapper;
    }

    return function orbitals(str) {
        let { structure, type } = parse(str);

        const wrapper1 = document.createElement("div");
        const wrapper2 = document.createElement("div");

        const elevation = Object.keys(structure).reduce((acc, val) => {
            const level = structure[val];
            if (!level) return acc;
            const maxSize = sublevelsSize(level) - 1;
            return maxSize >= acc ? maxSize : Math.max(maxSize, acc - maxSize - 2);
        }, 0);

        if (elevation > 0) {
            wrapper2.style = `padding-top: ${elevation * 2}em;`;
        }

        for (let i = 9; i > 0; i--) {
            if (!structure[i]) {
                continue;
            }
            wrapper2.appendChild(genLevel(structure, i, type === "grid1"));
        }

        wrapper1.appendChild(wrapper2);
        return wrapper1;
    };
})();

/*
#grid2#
1s1p1d1f
2s2p2d2f
3s3p3d3f
4s4p4d4f
5s5p5d5f
6s6p6d6f
7s7p7d7f
8s8p8d8f
9s9p9d9f
*/
