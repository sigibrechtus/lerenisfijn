(function(root){
  'use strict';
  const MAX_WORDS=200,MAX_LENGTH=100;
  function parseText(input){
    if(typeof input!=='string')throw new Error('Dit bestand bevat geen tekst.');
    const lines=input.replace(/^\uFEFF/,'').normalize('NFC').split(/\r?\n|\r/),words=[],seen=new Set(),metadata={};
    for(const raw of lines){
      const line=raw.trim().replace(/\s+/g,' ');if(!line)continue;
      if(line.startsWith('#')){const m=line.match(/^#\s*(titel|leerjaar|thema|woordsoort|methode)\s*:\s*(.+)$/i);if(m)metadata[m[1].toLowerCase()]=m[2];continue;}
      if(line.length>MAX_LENGTH)throw new Error('Een regel is te lang. Gebruik één woord of korte uitdrukking per regel.');
      if(/[<>\u0000]/.test(line))throw new Error('Gebruik een gewoon TXT-bestand, zonder HTML.');
      const key=line.toLocaleLowerCase('nl');if(seen.has(key))continue;seen.add(key);
      const m=line.match(/^(de|het)\s+(.+)$/i);words.push(m?{article:m[1].toLowerCase(),word:m[2],full:m[1].toLowerCase()+' '+m[2]}:{article:'',word:line,full:line});
      if(words.length>MAX_WORDS)throw new Error('Gebruik maximaal '+MAX_WORDS+' woorden per lijst.');
    }
    if(!words.length)throw new Error('De woordenlijst is leeg. Zet één woord per regel.');
    return {words,metadata};
  }
  function exportText(words,metadata={}){return Object.entries(metadata).map(([key,value])=>'# '+key+': '+String(value).replace(/[\r\n]/g,' ')).concat(words.map(item=>item.full)).join('\n')+'\n';}
  const api={parseText,exportText,MAX_WORDS};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DicteeWordLists=api;
})(typeof window==='undefined'?globalThis:window);
