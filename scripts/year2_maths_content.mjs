import fs from 'node:fs/promises';
import path from 'node:path';
import {profiles as year1Profiles,numberWords} from './year1_complete_content.mjs';
const S=(title,kind,mode,extra={})=>({title,kind,mode,...extra});
const units=[
  "Number — place value within 20",
  "Number — place value within 100",
  "Number — count in 2s, 3s, 5s and 10s",
  "Number — compare and order numbers to 100",
  "Number — number bonds and related facts",
  "Calculation — addition and subtraction within 20",
  "Calculation — add and subtract tens and ones",
  "Calculation — addition across a ten",
  "Calculation — subtraction across a ten",
  "Autumn consolidation and assessment",
  "Measurement — recognise and use money",
  "Calculation — equal groups and repeated addition",
  "Calculation — 2 times table",
  "Calculation — 5 and 10 times tables",
  "Calculation — division by sharing and grouping",
  "Measurement — length and height",
  "Measurement — mass, capacity and temperature",
  "Fractions — halves, quarters and thirds",
  "Fractions — equivalence and fractions of quantities",
  "Spring consolidation and assessment",
  "Geometry — properties of 2-D and 3-D shapes",
  "Geometry — position, direction and turns",
  "Measurement — o'clock, half past and quarter times",
  "Measurement — tell time to five minutes",
  "Statistics — tally charts and pictograms",
  "Statistics — block diagrams and simple tables",
  "Calculation — mixed-operation problems",
  "Measurement — problem solving across measures",
  "Number — reasoning investigations",
  "Summer assessment and transition to Year 3"
];
export const curriculum={
1:[S('Tens and ones within 20','place','partition',{max:20}),S('Read and write numbers to 20','place','words',{max:20}),S('Different ways to partition 20','place','exchange',{max:20}),S('One more and one less within 20','place','neighbours',{max:20}),S('Place value puzzles within 20','place','missing',{max:20})],
2:[S('Tens and ones within 100','place','partition'),S('Read and write two digit numbers','place','words'),S('Flexible partitioning','place','exchange'),S('Numbers on a number line','place','line'),S('Place value puzzles','place','missing')],
3:[S('Counting in twos','sequence','forward',{step:2}),S('Counting in fives','sequence','forward',{step:5}),S('Ten more and ten less','sequence','any',{step:10}),S('Counting in threes','sequence','forward',{step:3}),S('Missing numbers in counting patterns','sequence','mixed')],
4:[S('Compare two digit numbers','place','compare'),S('Use greater than less than and equal to','place','symbols'),S('Order numbers to 100','place','order'),S('Numbers between two bounds','place','between'),S('Compare and order number puzzles','place','compareMissing')],
5:[S('Number bonds to 20','bonds','20'),S('Related facts to 100','bonds','100'),S('Addition and subtraction fact families','calc','family'),S('Missing parts and wholes','calc','missing'),S('Adding three small numbers','calc','three')],
6:[S('Add by making ten','calc','add20'),S('Subtract through ten','calc','sub20'),S('Doubles and near doubles','calc','double'),S('Check with the inverse','calc','inverse20'),S('Addition and subtraction stories within 20','calc','story20')],
7:[S('Add tens to a two digit number','calc','addTens'),S('Subtract tens from a two digit number','calc','subTens'),S('Add ones without crossing ten','calc','addOnes'),S('Subtract ones without crossing ten','calc','subOnes'),S('Add two two digit numbers','calc','addTwo')],
8:[S('Bridge to the next ten','calc','addBridge'),S('Exchange ten ones for one ten','calc','addExchange'),S('Add two digit numbers across ten','calc','addTwoExchange'),S('Choose and explain an addition method','calc','addMethod'),S('Addition stories across ten','calc','addStory')],
9:[S('Subtract to the previous ten','calc','subBridge'),S('Exchange one ten for ten ones','calc','subExchange'),S('Subtract two digit numbers across ten','calc','subTwoExchange'),S('Choose and explain a subtraction method','calc','subMethod'),S('Subtraction stories across ten','calc','subStory')],
10:[S('Place value review','review','place'),S('Addition review','review','addition'),S('Subtraction review','review','subtraction'),S('Number reasoning','review','number'),S('Number assessment and reflection','review','autumn')],
11:[S('Count coins and notes','money','count'),S('Make the same amount in different ways','money','equivalent'),S('Compare amounts of money','money','compare'),S('Find change from one pound','money','change'),S('Shopping with two items','money','twoItems')],
12:[S('Recognise equal groups','groups','equal'),S('Repeated addition','groups','repeated'),S('Arrays and multiplication','groups','array'),S('Turn an array','groups','commute'),S('Equal groups in stories','groups','story')],
13:[S('Build the two times table','groups','times',{size:2}),S('Count pairs and find totals','groups','pairs',{size:2}),S('Odd and even numbers','groups','parity',{size:2}),S('Divide by two','division','group',{size:2}),S('Two times table problems','groups','story',{size:2})],
14:[S('Build the five times table','groups','times',{size:5}),S('Build the ten times table','groups','times',{size:10}),S('Connect the five and ten times tables','groups','fiveTen'),S('Missing multiplication facts','groups','missing'),S('Five and ten times table problems','groups','story',{size:5})],
15:[S('Share equally','division','share'),S('Make equal groups','division','group'),S('Multiplication and division families','division','family'),S('Choose sharing or grouping','division','story'),S('Solve division problems','division','missing')],
16:[S('Measure in centimetres','measure','cm'),S('Metres and centimetres','measure','metres'),S('Compare lengths','measure','lengthCompare'),S('Read a ruler from a nonzero start','measure','offset'),S('Length and height problems','measure','lengthProblem')],
17:[S('Read scales in grams and kilograms','measure','mass'),S('Compare masses','measure','massCompare'),S('Read millilitres and litres','measure','capacity'),S('Read a thermometer','measure','temperature'),S('Mass capacity and temperature problems','review','measures')],
18:[S('Equal and unequal parts','fraction','equal'),S('Halves of shapes and quantities','fraction','half',{den:2}),S('Quarters of shapes and quantities','fraction','quarter',{den:4}),S('Thirds of shapes and quantities','fraction','third',{den:3}),S('Find a fraction of a set','fraction','quantity')],
19:[S('One half is two quarters','fraction','equivalent'),S('Three quarters of a quantity','fraction','threeQuarters',{den:4,num:3}),S('Count in halves and quarters','fraction','count'),S('Find the whole from a part','fraction','whole'),S('Fraction problems','fraction','mixed')],
20:[S('Money and measure review','review','moneyMeasure'),S('Multiplication and division review','review','groups'),S('Fraction review','review','fractions'),S('Explain a mathematical mistake','review','mistakes'),S('Calculation and measure assessment','review','spring')],
21:[S('Sides and vertices of two dimensional shapes','shape','sides'),S('Lines of symmetry','shape','symmetry'),S('Faces edges and vertices','shape','solid'),S('Flat shapes on solid faces','shape','faces'),S('Sort shapes by their properties','shape','sort')],
22:[S('Describe position on a grid','direction','position'),S('Clockwise and anticlockwise turns','direction','turn'),S('Quarter half and three quarter turns','direction','amount'),S('Follow a route','direction','route'),S('Repeating shape and movement patterns','direction','pattern')],
23:[S('Read oclock and half past times','time','half'),S('Quarter past the hour','time','quarterPast'),S('Quarter to the hour','time','quarterTo'),S('Match analogue and digital times','time','match'),S('Hours minutes and duration','time','duration')],
24:[S('Count minutes around the clock','time','minutes'),S('Five minute times past the hour','time','past'),S('Five minute times to the hour','time','to'),S('Draw hands on a clock','time','draw'),S('Solve time problems','time','elapsed')],
25:[S('Collect and record with tally marks','data','tally'),S('Read a pictogram with a key of one','data','pictogram',{key:1}),S('Read a pictogram with a key of two','data','pictogram',{key:2}),S('Compare categories in a pictogram','data','difference',{key:2}),S('Make and explain a pictogram','data','complete',{key:2})],
26:[S('Read a block diagram','data','block'),S('Draw a block diagram','data','draw'),S('Read a simple table','data','table'),S('Ask and answer questions about data','data','total'),S('Solve problems with data','data','difference',{key:1})],
27:[S('Choose addition or subtraction','calc','story'),S('Choose multiplication or division','division','story'),S('Two step addition and subtraction','calc','twoStep'),S('Check a missing number','calc','missing'),S('Mixed calculation problems','review','operations')],
28:[S('Money problems','money','twoItems'),S('Length problems','measure','lengthProblem'),S('Mass and capacity problems','review','measures'),S('Time problems','time','elapsed'),S('Choose a sensible unit','measure','unit')],
29:[S('Investigate odd and even numbers','groups','parity'),S('Investigate number patterns','sequence','mixed'),S('Find different ways to make a total','bonds','all'),S('Investigate equal groups','groups','missing'),S('Explain and prove a number claim','review','number')],
30:[S('Place value assessment','review','place'),S('Calculation assessment','review','operations'),S('Fractions and measures assessment','review','spring'),S('Shape and data assessment','review','shapeData'),S('Ready for the next maths step','review','final')]
};
export const profiles={
place:{v:['tens','ones','digit','partition','compare'],prior:'Count a full ten and the remaining ones.',steps:['Build the number with tens and ones.','Keep each ten together and name the value of each digit.','Move, compare or exchange the pieces to answer the question.','Rebuild the number to check that its value is unchanged.'],mis:'Tess thinks the 4 in  forty-two means four ones. What does it represent?',check:'The position of a digit determines its value.'},
sequence:{...year1Profiles.sequence,prior:'Count forwards and backwards in ones from different starting numbers.'},
bonds:{...year1Profiles.bonds,prior:'Recall pairs that total ten and connect a pair to a whole.'},
calc:{v:['add','subtract','exchange','difference','inverse'],prior:'Partition a two digit number into tens and ones.',steps:['Build the starting number and identify what changes.','Move the tens and ones separately, keeping their values.','Exchange ten ones for one ten, or one ten for ten ones, when needed.','Read the result and check using the inverse operation.'],mis:'Tess changes the tens digit but forgets the ten ones exchanged. Can you show the exchange?',check:'An exchange changes the representation but not the total value.'},
groups:{...year1Profiles.groups,v:['equal groups','array','rows','multiply','times'],prior:'Count equal steps of two, five or ten.'},
division:{v:['share','group','divide','equal','inverse'],prior:'Recognise equal groups and find their combined total.',steps:['Count the whole collection.','Identify whether the number of groups or the size of each group is known.','Move one object at a time to share equally, or collect groups of the required size.','Count the answer and check with multiplication.'],mis:'Tess counts all the objects when the question asks how many groups. What should she count?',check:'The group size multiplied by the number of groups gives the whole.'},
money:{...year1Profiles.money,prior:'Recognise coin values and count in twos, fives and tens.'},
measure:{v:['unit','scale','interval','centimetre','gram','litre','degree'],prior:'Count equal intervals on a number line.',steps:['Name the unit and read the labelled scale marks.','Find the value of one interval.','Locate the measurement and read or calculate the required amount.','Check that the answer uses the same unit as the question.'],mis:'Tess counts the marks instead of the spaces on a scale. Which interval did she miss?',check:'Equal intervals on a linear scale represent equal differences.'},
fraction:{v:['whole','equal parts','half','quarter','third','numerator','denominator'],prior:'Share a small collection into two equal parts.',steps:['Identify the whole and the number of equal parts.','Share or partition the whole equally.','Select the required number of parts.','Combine all parts to check the original whole.'],mis:'Tess calls any small piece a quarter. What must be true about all four parts?',check:'The denominator tells how many equal parts make one whole.'},
shape:{...year1Profiles.shape,v:['side','vertex','vertices','face','edge','symmetry'],prior:'Name common flat and solid shapes.'},
direction:{...year1Profiles.position,v:['clockwise','anticlockwise','quarter turn','half turn','route'],prior:'Recognise left, right, up and down from a fixed starting point.'},
time:{...year1Profiles.time,prior:'Distinguish the short hour hand from the long minute hand.'},
data:{v:['tally','pictogram','key','category','block diagram','total'],prior:'Count collections and compare which has more or fewer.',steps:['Read the title, category labels and key.','Count tally groups, symbols or blocks using their stated values.','Compare or combine the category totals to answer the question.','Check the answer against the original data and the key.'],mis:'Tess counts one picture as one person although the key says two. What is the correct count?',check:'Every symbol in the pictogram represents the number shown in the key.'}
};
const review={place:[['place','partition'],['place','compare'],['place','order'],['place','exchange'],['sequence','any',{step:10}]],addition:[['calc','addTens'],['calc','addOnes'],['calc','addBridge'],['calc','addTwoExchange'],['calc','three']],subtraction:[['calc','subTens'],['calc','subOnes'],['calc','subBridge'],['calc','subTwoExchange'],['calc','inverse20']],number:[['place','missing'],['sequence','mixed'],['calc','missing'],['groups','parity'],['bonds','100']],autumn:[['place','partition'],['bonds','20'],['calc','addTwoExchange'],['calc','subTwoExchange'],['calc','story']],measures:[['measure','mass'],['measure','capacity'],['measure','temperature'],['measure','lengthProblem'],['measure','massCompare']],moneyMeasure:[['money','count'],['money','change'],['measure','cm'],['measure','capacity'],['measure','temperature']],groups:[['groups','array'],['groups','times',{size:5}],['division','share'],['division','group'],['groups','missing']],fractions:[['fraction','half',{den:2}],['fraction','third',{den:3}],['fraction','equivalent'],['fraction','threeQuarters',{den:4,num:3}],['fraction','whole']],mistakes:[['calc','addExchange'],['money','count'],['groups','array'],['fraction','quarter',{den:4}],['measure','offset']],spring:[['money','twoItems'],['division','share'],['fraction','equivalent'],['fraction','third',{den:3}],['measure','mass']],operations:[['calc','addTwoExchange'],['calc','subTwoExchange'],['groups','times',{size:5}],['division','group'],['calc','twoStep']],shapeData:[['shape','sides'],['shape','solid'],['direction','turn'],['data','pictogram',{key:2}],['data','block']],final:[['place','exchange'],['calc','twoStep'],['fraction','threeQuarters',{den:4,num:3}],['time','elapsed'],['data','difference',{key:2}]]};
function concrete(r,i){if(r.kind!=='review')return r;const [kind,mode,extra]=review[r.mode][i%5];return {...r,kind,mode,...extra};}
const cmp=(a,b)=>a>b?'>':a<b?'<':'=';
const timeWords=(h,m)=>m===0?`${numberWords(h)} o'clock`:m===15?`quarter past ${numberWords(h)}`:m===30?`half past ${numberWords(h)}`:m===45?`quarter to ${numberWords(h%12+1)}`:m<30?`${m} minutes past ${numberWords(h)}`:`${60-m} minutes to ${numberWords(h%12+1)}`;
export function question(recipe,index=0,level='expected'){
 const r=concrete(recipe,index),i=index%10,low=level==='lower',mode=r.mode;
 let m={...r},q='',a='',answer;
 const n=r.max===20?11+i%9:(low?20:40)+3+i*3;
 switch(r.kind){
 case 'place':{
  m.n=n;
  if(mode==='partition'){q=`Show ${n} in tens and ones.`;a=`${Math.floor(n/10)} tens and ${n%10} ones.`;}
  else if(mode==='words'){q=`Write ${n} in words.`;a=numberWords(n)+'.';}
  else if(mode==='exchange'){q=`Complete: ${n} = ${Math.floor(n/10)-1} tens + ___ ones.`;a=`${n%10+10} ones. One ten was exchanged for ten ones.`;}
  else if(mode==='neighbours'){q=`Find one less and one more than ${n}.`;a=`One less is ${n-1}. One more is ${n+1}.`;}
  else if(mode==='line'){m.lo=Math.floor(n/10)*10;m.hi=m.lo+10;q=`Mark ${n} on the number line.`;a=`${n}, ${n-m.lo} intervals after ${m.lo}.`;}
  else if(['compare','symbols'].includes(mode)){m.b=i%3===0?n:n+(i%2?2:-3);q=`Write <, > or =: ${n} ___ ${m.b}.`;a=`${n} ${cmp(n,m.b)} ${m.b}.`;}
  else if(mode==='order'){m.values=[n+3,n-2,n,n+1];q=`Order ${m.values.join(', ')} from smallest.`;a=[...m.values].sort((a,b)=>a-b).join(', ')+'.';}
  else if(mode==='between'){m.lo=n;m.hi=n+4;q=`Write every whole number between ${n} and ${n+4}.`;a=`${n+1}, ${n+2}, ${n+3}.`;}
  else if(mode==='compareMissing'){m.lo=n;m.hi=n+5;q=`Find all whole numbers that fit: ${n} < ___ < ${n+5}.`;a=[1,2,3,4].map(k=>n+k).join(', ')+'.';}
  else {m.t=Math.floor(n/10);m.o=n%10;q=`A number has ${m.t} tens and ${m.o} ones. What is it?`;a=`${n}.`;}
  break;
 }
 case 'sequence':{
  const step=r.step??[2,3,5,10][i%4],back=mode==='mixed'&&i%2===1,start=mode==='any'?13+i:back?step*8:step*(i%3);m={...m,step:back?-step:step,values:Array.from({length:5},(_,k)=>start+k*(back?-step:step)),missing:2};
  q=`Fill the gap: ${m.values.map((v,k)=>k===2?'___':v).join(', ')}.`;a=`${m.values[2]}. ${back?'Subtract':'Add'} ${step} each time.`;break;
 }
 case 'bonds':{
  m.total=mode==='100'?100:mode==='all'?10+i%5:20;m.part=mode==='100'?(1+i%9)*10:(low?5:7)+i%7;
  if(mode==='all'){q=`Find three different pairs that total ${m.total}.`;a=`For example: 0 + ${m.total}, 1 + ${m.total-1}, 2 + ${m.total-2}. Accept other correct pairs.`;}
  else {q=`${m.part} + ___ = ${m.total}.`;a=`${m.total-m.part}. ${m.part} + ${m.total-m.part} = ${m.total}.`;}
  break;
 }
 case 'calc':{
  const sub=/^sub/.test(mode)||['story','story20','inverse20','missing'].includes(mode)&&i%2===1;
  let x=(low?20:40)+i%3*10+2+i%5,y=2+i%3;
  if(['add20','sub20','inverse20','story20','family','missing'].includes(mode)){x=sub?12+i%5:7+i%3;y=sub?x-10+2:4+i%4;}
  else if(mode==='double'){x=3+i%7;y=x+(i%2);}
  else if(mode==='three'){x=2+i%4;y=3+i%3;m.c=1+i%5;}
  else if(mode==='addTens'||mode==='subTens'){x=(sub?50:20)+i%3*10+3;y=(1+i%2)*10;}
  else if(mode==='addOnes'){x=(low?20:40)+i%3*10+2;y=1+i%5;}
  else if(mode==='subOnes'){x=(low?20:40)+i%3*10+7;y=1+i%5;}
  else if(mode==='addTwo'){x=21+i%3*10;y=12+i%4;}
  else if(sub){x=(low?30:50)+i%3*10+2;y=(mode==='subTwoExchange'?10:0)+5+i%4;}
  else{x=(low?20:40)+i%3*10+7;y=(mode==='addTwoExchange'?10:0)+5+i%4;}
  if(mode==='twoStep'){x=20+i*2;y=4+i%4;m.c=2+i%3;}
  const total=mode==='three'?x+y+m.c:mode==='twoStep'?x+y-m.c:sub?x-y:x+y;
  m={...m,a:x,b:y,op:sub?'−':'+',total,max:Math.max(20,Math.ceil(Math.max(x,total)/10)*10)};
  q=`${x} ${m.op} ${y} = ___`;a=`${x} ${m.op} ${y} = ${total}.`;
  if(mode==='three'){q=`${x} + ${y} + ${m.c} = ___`;a=`${total}. Add two numbers, then add ${m.c}.`;}
  if(mode==='twoStep'){q=`${x} children are on a bus. ${y} get on, then ${m.c} get off. How many now?`;a=`${total} children. ${x} + ${y} = ${x+y}, then ${x+y} − ${m.c} = ${total}.`;}
  else if(/story/i.test(mode)){q=sub?`There are ${x} books. ${y} are borrowed. How many remain?`:`There are ${x} books. ${y} more arrive. How many now?`;a=`${total} books. ${x} ${m.op} ${y} = ${total}.`;}
  if(mode==='missing'){q=`${x} ${m.op} ___ = ${total}.`;a=`${y}. Check: ${x} ${m.op} ${y} = ${total}.`;}
  if(mode==='family'){q=`Use ${x}, ${y}, ${total} to write two additions and two subtractions.`;a=`${x}+${y}=${total}, ${y}+${x}=${total}, ${total}−${x}=${y}, ${total}−${y}=${x}.`;}
  if(mode==='inverse20'){q+=` Check with ${sub?'addition':'subtraction'}.`;a+=sub?` Check: ${total} + ${y} = ${x}.`:` Check: ${total} − ${y} = ${x}.`;}
  break;
 }
 case 'groups':{
  m.groups=low?2+i%3:3+i%5;m.size=r.size??[2,5,10][i%3];if(mode==='equal'||mode==='repeated'||mode==='array'||mode==='commute')m.size=2+i%4;
  m.total=m.groups*m.size;
  q=`${m.groups} groups of ${m.size}. How many altogether?`;a=`${m.total}. ${m.groups} × ${m.size} = ${m.total}.`;
  if(mode==='repeated'){q='Write the repeated addition for the groups.';a=`${Array(m.groups).fill(m.size).join(' + ')} = ${m.total}.`;}
  if(mode==='commute'){q='Write two multiplication facts for this array.';a=`${m.groups} × ${m.size} = ${m.total} and ${m.size} × ${m.groups} = ${m.total}.`;}
  if(mode==='fiveTen'){m.size=5;m.total=m.groups*5;q=`${m.groups} × 5 = ${m.total}. What is ${m.groups} × 10?`;a=`${m.groups*10}. Double ${m.total}.`;}
  if(mode==='parity'){m.total=low?5+i:11+i;q=`Is ${m.total} odd or even? Show pairs.`;a=`${m.total%2?'Odd, with one left over.':'Even, with no objects left over.'}`;}
  if(mode==='missing'){q=`___ × ${m.size} = ${m.total}.`;a=`${m.groups}. There are ${m.groups} groups of ${m.size}.`;}
  if(mode==='story'){q=`${m.groups} bags hold ${m.size} apples each. How many apples?`;a=`${m.total} apples. ${m.groups} × ${m.size} = ${m.total}.`;}
  break;
 }
 case 'division':{
  m.size=r.size??[2,5,10][i%3];m.groups=low?2+i%3:3+i%4;m.total=m.groups*m.size;
  if(mode==='share'||mode==='story'&&i%2===0){m.share=true;q=`Share ${m.total} counters equally among ${m.groups} children. How many each?`;a=`${m.size} each. ${m.total} ÷ ${m.groups} = ${m.size}.`;}
  else {m.share=false;q=`Put ${m.total} counters in groups of ${m.size}. How many groups?`;a=`${m.groups} groups. ${m.total} ÷ ${m.size} = ${m.groups}.`;}
  if(mode==='family'){q=`Use ${m.groups}, ${m.size}, ${m.total} to write one multiplication and two divisions.`;a=`${m.groups} × ${m.size} = ${m.total}; ${m.total} ÷ ${m.size} = ${m.groups}; ${m.total} ÷ ${m.groups} = ${m.size}.`;}
  if(mode==='missing'){q=`${m.total} ÷ ___ = ${m.groups}.`;a=`${m.size}. Check: ${m.groups} × ${m.size} = ${m.total}.`;}
  break;
 }
 case 'money':{
  const sets=[[20,10,5,2],[50,20,10],[10,10,5,5],[20,20,10,2],[50,10,5]];m.coins=low?sets[i%5].slice(0,3):sets[i%5];m.total=m.coins.reduce((a,b)=>a+b,0);
  q='How much money is shown?';a=`${m.total}p.`;
  if(mode==='count'&&i%5===4){m.notes=[5,10];q='How much money do these notes show?';a='£15.';}
  if(mode==='equivalent'){q=`Make ${m.total}p in two ways.`;a=`For example: ${m.coins.join('p + ')}p, or ${m.total} one-penny coins. Accept any two correct combinations.`;}
  if(mode==='compare'){m.other=m.total+5;q=`Which is worth more: the coins shown or ${m.other}p?`;a=`${m.other}p is worth 5p more than ${m.total}p.`;}
  if(mode==='change'){m.price=low?20+i*5:32+i*4;m.pay=100;q=`A toy costs ${m.price}p. Pay £1. How much change?`;a=`${100-m.price}p. £1 = 100p.`;}
  if(mode==='twoItems'){m.price=20+i*3;m.second=10+i*2;m.pay=100;q=`A pen costs ${m.price}p and a ruler ${m.second}p. Find the change from £1.`;a=`${100-m.price-m.second}p change. The total cost is ${m.price+m.second}p.`;}
  break;
 }
 case 'measure':{
  m.a=3+i%6;m.b=2+i%4;m.start=0;m.unit='cm';
  if(mode==='cm'){q='Read the length shown on the ruler.';a=`${m.a} cm.`;}
  else if(mode==='offset'){m.start=2+i%3;m.end=m.start+m.a;q='The strip does not start at zero. How long is it?';a=`${m.a} cm. ${m.end} − ${m.start} = ${m.a}.`;}
  else if(mode==='metres'){m.a=1+i%3;m.b=10+i*5;q=`Complete: ${m.a} m ${m.b} cm = ___ cm.`;a=`${m.a*100+m.b} cm. Each metre is 100 cm.`;}
  else if(mode==='lengthCompare'){m.b=m.a+2;q='Which strip is longer? How much longer?';a=`B is 2 cm longer than A.`;}
  else if(mode==='lengthProblem'){m.a=low?12+i:25+i*3;m.b=4+i%5;q=`A ribbon is ${m.a} cm. Cut off ${m.b} cm. How much remains?`;a=`${m.a-m.b} cm. ${m.a} − ${m.b} = ${m.a-m.b}.`;}
  else if(mode==='mass'||mode==='capacity'){m.unit=mode==='mass'?(i%2?'kg':'g'):(i%2?'l':'ml');m.step=['g','ml'].includes(m.unit)?100:1;m.value=(2+i%6)*m.step;m.max=m.step*10;q=`Read the ${mode==='mass'?'mass':'volume'} on the scale.`;a=`${m.value} ${m.unit}. Each interval is ${m.step} ${m.unit}.`;}
  else if(mode==='massCompare'){m.unit='g';m.a=200+i*50;m.b=m.a+100;q=`Bag A is ${m.a} g. Bag B is ${m.b} g. How much heavier is B?`;a=`100 g heavier.`;}
  else if(mode==='temperature'){m.step=2;m.value=4+i*2;m.max=30;m.unit='°C';q='Read the temperature on the thermometer.';a=`${m.value}°C. Each interval is 2°C.`;}
  else{const pairs=[['length of a pencil','cm','m'],['mass of an apple','g','kg'],['water in a cup','ml','l'],['temperature of a room','°C','cm'],['height of a door','m','mm']];const [object,unit,other]=pairs[i%5];m.object=object;m.choices=[unit,other];q=`Choose a sensible unit for the ${object}: ${unit} or ${other}?`;a=`${unit}.`;}
  break;
 }
 case 'fraction':{
  m.den=r.den??[2,3,4][i%3];m.num=r.num??1;m.total=m.den*(low?2+i%3:3+i%5);
  if(mode==='equal'){m.den=4;m.equal=i%2===0;q='Does the shape show four equal quarters? Explain.';a=m.equal?'Yes. All four parts have equal area.':'No. The parts have different areas.';}
  else if(mode==='equivalent'){m.den=4;m.num=2;q='Shade one half of each strip. Complete: 1/2 = ___/4.';a='2/4. Two quarters cover the same amount as one half.';}
  else if(mode==='count'){m.den=i%2?4:2;m.values=Array.from({length:5},(_,k)=>k);q=`Count in ${m.den===2?'halves':'quarters'}: 0, 1/${m.den}, ___, 3/${m.den}, 4/${m.den}.`;a=`2/${m.den}${m.den===2?' = 1 whole':' = 1/2'}.`;}
  else if(mode==='whole'){q=`One ${m.den===2?'half':m.den===3?'third':'quarter'} is ${m.total/m.den}. What is the whole?`;a=`${m.total}. ${m.den} × ${m.total/m.den} = ${m.total}.`;}
  else if(['half','quarter','third'].includes(mode)&&i%2===0){m.shape=true;q=`Shade ${m.num}/${m.den} of the shape.`;a=`Shade ${m.num} of the ${m.den} equal parts.`;}
  else {q=`Find ${m.num}/${m.den} of ${m.total}.`;a=`${m.total/m.den*m.num}. One part is ${m.total/m.den}.`;}
  break;
 }
 case 'shape':{
  const flat=[['triangle',3,3],['square',4,4],['rectangle',4,4],['pentagon',5,5],['hexagon',6,6]],solids=[['cube',6,12,8],['cuboid',6,12,8],['triangular prism',5,9,6],['square based pyramid',5,8,5]];
  const [name,sides,vertices]=flat[i%5];m.name=name;m.sides=sides;m.vertices=vertices;
  if(mode==='sides'){q='Name the shape. Count its sides and vertices.';a=`${name}: ${sides} sides and ${vertices} vertices.`;}
  else if(mode==='symmetry'){m.name=i%2?'rectangle':'square';q='Draw every line of symmetry.';a=m.name==='square'?'4 lines: horizontal, vertical and both diagonals.':'2 lines: horizontal and vertical.';}
  else if(mode==='solid'){const [name,faces,edges,vertices]=solids[i%4];m={...m,name,faces,edges,vertices};q='Name the solid. Count its faces, edges and vertices.';a=`${name}: ${faces} faces, ${edges} edges, ${vertices} vertices.`;}
  else if(mode==='faces'){m.name=['cube','cylinder','triangular prism'][i%3];q='Name the flat shapes on the solid’s faces.';a=['Squares.','Circles. The curved surface is not a flat face.','Triangles and rectangles.'][i%3];}
  else{m.names=['triangle','square','rectangle','pentagon','hexagon'];q='Sort the shapes: four sides or not four sides.';a='Four sides: square, rectangle. Not four: triangle, pentagon, hexagon.';}
  break;
 }
 case 'direction':{
  m.start=i%4;m.turn=[1,2,3][i%3];m.clockwise=i%2===0;m.finish=(m.start+(m.clockwise?m.turn:-m.turn)+4)%4;const dirs=['up','right','down','left'];
  if(mode==='position'||mode==='route'){m.dx=1+i%3;m.dy=1+(i+1)%3;q=`Start at the dot. Move ${m.dx} squares right and ${m.dy} up. Mark the finish.`;a=`Column ${m.dx+1}, row ${m.dy+1}, counting from the bottom left.`;}
  else if(mode==='pattern'){m.values=[0,1,2,3,0];q='Continue the turning pattern. Draw the next two arrows.';a='Right, then down. Each turn is a quarter turn clockwise.';}
  else{q=`The arrow points ${dirs[m.start]}. Turn ${m.turn===1?'a quarter':m.turn===2?'a half':'three quarters'} turn ${m.clockwise?'clockwise':'anticlockwise'}. Draw the finish.`;a=`It points ${dirs[m.finish]}.`;}
  break;
 }
 case 'time':{
  m.hour=1+i%12;m.minute=mode==='quarterPast'?15:mode==='quarterTo'?45:mode==='half'?i%2?30:0:mode==='past'?[5,10,20,25][i%4]:mode==='to'?[35,40,50,55][i%4]:[0,5,15,25,30,40,45,55][i%8];
  q='Write the time shown.';a=timeWords(m.hour,m.minute)+'.';
  if(mode==='draw'){q=`Draw ${timeWords(m.hour,m.minute)}.`;a=`Minute hand on ${m.minute===0?12:m.minute/5}. Hour hand ${m.minute===0?'on '+m.hour:'between '+m.hour+' and '+(m.hour%12+1)}.`;}
  if(mode==='match'){q='Write the digital time for this clock.';a=`${m.hour}:${String(m.minute).padStart(2,'0')}.`;}
  if(mode==='minutes'){q='How many minutes past the hour does the long hand show?';a=`${m.minute} minutes.`;}
  if(mode==='duration'){m.hours=1+i%3;q=`How many minutes are in ${m.hours} hour${m.hours>1?'s':''}?`;a=`${m.hours*60} minutes.`;}
  if(mode==='elapsed'){m.minute=[0,15,30,45][i%4];m.add=15+i%3*5;const t=m.hour*60+m.minute+m.add;m.endHour=Math.floor(t/60)%12||12;m.endMinute=t%60;q=`Start at ${m.hour}:${String(m.minute).padStart(2,'0')}. What time is ${m.add} minutes later?`;a=`${m.endHour}:${String(m.endMinute).padStart(2,'0')}.`;}
  break;
 }
 case 'data':{
  m.labels=['Apples','Pears','Plums'];m.key=r.key??1;m.values=[2+i%4,4+i%3,3+i%2].map(n=>n*m.key);m.ask=i%3;
  if(['tally','pictogram','table','block'].includes(mode)){q=`How many children chose ${m.labels[m.ask].toLowerCase()}?`;a=`${m.values[m.ask]} children.`;}
  else if(mode==='difference'){q='How many more chose pears than apples?';a=`${m.values[1]-m.values[0]} more${m.values[1]<m.values[0]?' (so fewer chose pears)':''}.`;if(m.values[1]<m.values[0]){q='How many more chose apples than pears?';a=`${m.values[0]-m.values[1]} more.`;}}
  else if(mode==='total'){q='How many children voted altogether?';a=`${m.values.reduce((a,b)=>a+b,0)} children.`;}
  else{q=`Complete the ${mode==='draw'?'block diagram':'pictogram'} for ${m.values[2]} children choosing plums.`;a=`${m.values[2]/m.key} ${mode==='draw'?'blocks':'symbols'} in the plums row.`;}
  break;
 }
 default:throw Error('Unknown topic '+r.kind);
 }
 answer=a;return {q,a,answer,model:m};
}
function higher(recipe,i){
 const e=question(recipe,i+3),m=e.model;
 const prompts=['Explain using the picture.','Show a second way to check.','Explain a mistake to avoid.','Draw another example.','Make a similar question and answer it.'];
 // Keep the reasoning prompt short enough for a single A4 pupil sheet.
 return {...e,q:e.q+' '+prompts[i],a:e.a+(i===2?' Check the operation, units and labels against the picture.':i===4?' Accept a similar question with a correct matching answer.':' Accept a correct explanation or matching model.')};
}
export function makeLesson(week,day){
 const r=curriculum[week][day-1],examples=Array.from({length:5},(_,i)=>question(r,i));
 const p=profiles[concrete(r,0).kind],term=week<=10?'Autumn':week<=20?'Spring':'Summer';
 const expected=Array.from({length:5},(_,i)=>question(r,i+5));
 const kind=concrete(r,0).kind;
 const objectives={place:'represent, partition and compare numbers using place value',sequence:'complete and explain a counting pattern',bonds:'use parts and wholes to find related number facts',calc:'use a model to calculate accurately and check the answer',groups:'use equal groups to explain multiplication',division:'use sharing or grouping to solve a division',money:'use coin values to solve a money problem',measure:'read and use measurements with the correct units',fraction:'identify equal parts and find fractions',shape:'describe and compare shapes using their properties',direction:'describe and follow positions, movements and turns',time:'read clocks and solve time problems',data:'represent and interpret data using a key or scale'};
 const prereq={calc:{kind:'place',mode:'partition',max:20},division:{kind:'groups',mode:'equal',size:2},fraction:{kind:'division',mode:'share',size:2},money:{kind:'sequence',mode:'forward',step:5},time:{kind:'time',mode:'half'},measure:{kind:'sequence',mode:'forward',step:2}}[kind]??r;
 return {year:2,week,day,term,title:r.title,slug:r.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),recipe:r,character:'Tess',objective:`To ${objectives[kind]}.`,vocabulary:p.v,prior:p.prior,resources:'Counters, base-ten equipment, numeral cards and the topic equipment shown in the lesson.',successCriteria:['I can represent the quantities accurately.','I can use the model to find an answer.','I can explain how I checked.'],misconception:p.mis,check:p.check,warmup:p.prior+' Ask pupils to build an example before naming it.',teacherModel:p.steps,guided:examples[1].q,independent:'Use the You do example, then select the appropriate one-page worksheet.',plenary:examples[4].q+' Ask pupils to show how they know.',preteach:{focus:p.prior,steps:p.steps.slice(0,3),questions:Array.from({length:3},(_,i)=>question(prereq,i,'lower'))},lower:Array.from({length:5},(_,i)=>question(r,i+5,'lower')),expected,higher:Array.from({length:5},(_,i)=>higher(r,i)),examples};
}
if(process.argv[1]&&path.basename(process.argv[1])==='year2_maths_content.mjs'){
 const root=path.resolve(process.argv[2]??'.qa/year2-maths');await fs.mkdir(root,{recursive:true});
 const lessons=Object.keys(curriculum).flatMap(w=>curriculum[w].map((_,i)=>makeLesson(+w,i+1)));
 await fs.writeFile(path.join(root,'lessons.json'),JSON.stringify(lessons,null,2));
 await fs.writeFile(path.join(root,'curriculum.json'),JSON.stringify(Object.keys(curriculum).map(w=>({week:+w,term:+w<=10?'Autumn':+w<=20?'Spring':'Summer',unit:units[+w-1],days:curriculum[w].map(r=>r.title)})),null,2));
 console.log('Prepared '+lessons.length+' Year 2 lesson specifications.');
}
