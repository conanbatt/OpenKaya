var sgf_file_one = "(;FF[4]SZ[19]KM[-5.5]RU[Japanese]OT[N/A]HA[5]AB[dd][pd][dp][pp][jj]PW[crownout]WR[1d]PB[crownout]BR[1d];W[nc]WL[295.829];B[pf]BL[300.568];W[fc]WL[297.759];B[id]BL[295.185];W[cf]WL[297.501];B[df]BL[297.388];W[dg]WL[299.143];B[ef]BL[298.298];W[ce]WL[300.269];B[cd]BL[297.550];W[ge]WL[294.684];B[hc]BL[286.097];W[ie]WL[289.350];B[gd]BL[288.286];W[fd]WL[302.270];B[fe]BL[295.573];W[he]WL[292.198];B[ed]BL[294.813];W[jd]WL[293.128];B[gc]BL[303.838];W[ff]WL[294.306];B[ee]BL[303.436];W[fb]WL[293.384];B[jc]BL[299.227];W[kc]WL[299.293];B[kd]BL[298.285];W[je]WL[300.595];B[kb]BL[297.552];W[lc]WL[301.508];B[jb]BL[295.158];W[eg]WL[303.225];B[cg]BL[292.349];W[ch]WL[305.457];B[bg]BL[289.500];W[bh]WL[308.776];B[fg]BL[287.455];W[gf]WL[311.198];B[jp]BL[275.700];W[db]WL[314.398];B[cb]BL[283.294];W[bc]WL[312.781];B[bd]BL[271.500];W[cc]WL[326.125];B[bb]BL[260.069];W[dc]WL[336.585];B[ac]BL[260.967];W[ae]WL[321.687];B[ad]BL[271.489];W[ec]WL[301.587];B[gb]BL[280.715];W[ab]WL[316.157];B[aa]BL[279.769];W[ea]WL[270.752];B[ca]BL[322.824];W[ag]WL[251.243];B[ga]BL[324.447];W[be]WL[265.682];B[lb]BL[324.612];W[mc]WL[261.474];B[fa]BL[332.952];W[de]WL[259.047](;B[ab]BL[336.560];W[qh]WL[255.098])(;B[le]BL[328.873];W[ne]WL[267.333];B[ph]BL[326.533];W[pi]WL[270.123];B[oh]BL[325.450];W[qg]WL[273.216];B[mf]BL[323.138];W[pg]WL[261.995];B[of]BL[330.465];W[nf]WL[267.389];B[ng]BL[330.012];W[og]WL[263.436];B[me]BL[333.685];W[od]WL[259.296];B[oe]BL[329.957];W[nd]WL[268.311];B[pc]BL[330.043];W[qf]WL[268.291];B[pe]BL[329.478];W[mg]WL[269.755];B[nh]BL[327.231];W[lg]WL[271.700];B[qj]BL[296.339];W[mi]WL[293.714];B[oi]BL[299.174];W[oj]WL[299.491];B[pj]BL[297.321];W[qi]WL[301.530];B[nj]BL[297.410];W[ok]WL[301.753];B[ni]BL[296.934];W[rj]WL[287.507];B[nk]BL[308.704];W[ob]WL[284.400];B[pb]BL[309.027];W[rd]WL[289.047];B[rc]BL[297.467];W[qd]WL[300.731];B[oa]BL[291.129];W[na]WL[306.724];B[qa]BL[290.304];W[ke]WL[298.418];B[qc]BL[289.841];W[rb]WL[302.432];B[ol]BL[281.815];W[pk]WL[316.081];B[qk]BL[281.986];W[pl]WL[317.401];B[rk]BL[278.136];W[nl]WL[304.902];B[om]BL[286.870];W[pm]WL[293.600];B[pn]BL[298.955];W[rl]WL[299.490];B[ri]BL[297.835];W[sk]WL[280.808];B[sj]BL[310.367];W[sl]WL[288.288];B[sb]BL[287.153];W[on]WL[302.192];B[nm]BL[291.109];W[ml]WL[304.657];B[mj]BL[284.783];W[lj]WL[309.285]))"

module("loading sgf", {
    setup: function() {

        kogo = document.getElementById("kogo").textContent; 

    },
    teardown: function() {
    }
});

test("Should be able to load an sgf", function(){

    res = new SGFParser(sgf_file_one);
    equal(res.status, SGFPARSER_ST_PARSED);
});

test("should load sgf with comments", function(){


});

test("should load sgf with markers(triangles, squares, etc)", function(){


});

test("should be able to load KOGO", function(){

    res = new SGFParser(kogo);
    equal(res.status, SGFPARSER_ST_PARSED);

});

