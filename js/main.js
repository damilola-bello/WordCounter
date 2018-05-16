var lastChar='', currentChar='';
var spaces=0, paragraphs = 1, words = 0, count = 0, lastCount = 0;
var isPaste = false;
var pasteTimeout = 0;

$(document).ready(function () {
	$('#container').slideDown(600, "linear");
});


var common_words = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is'];

$('#text-input').on('keyup', function(e){
    start();
});
$('#text-input').on('paste', function(e){
	//When there is a paste event, either through right clicking and pasting or through control+v, set the isPaste to true then a timer waits for 0.25s to allow the text to get pasted then calls start() method
    isPaste = true;
	pasteTimeout = setTimeout(function(){
		isPaste = false;
		start();
	}, 250);
});


function start()
{
	//If there was a paste event from Ctrl+V, return
	if(isPaste === true)
		return;

    count = $('#text-input').val().length;
    count = CommarizeInteger(count.toString());
    $('#char-count').text(count);
    $('#char_c').text(count);
    ScrutinizeText($('#text-input').val());
}

var wordFrequency1 = [];
var wordFrequency2 = [];
var wordFrequency3 = [];
var characters = [];

var html1 = '';
var html2 = '';
var html3 = '';
var html_c = '';

const OPEN = '<li class="li">';
const CLOSE = '</li>';

var apostrophe_pattern = /'/;
var word_with_apostrophe = /^[A-Za-z]+'[A-Za-z]+$/;
var word_pattern2 = /[a-zA-Z0-9']+/g;

function reset()
{
    DisplayEmptyDensity();
    lastChar=''; currentChar=''; html1=''; html2=''; html3=''; html_c='';
    spaces=0; paragraphs=1; words=0; count=0; lastCount=0;
    $('#space_c, #word_c, #char_c, #para_c, #char-count').text('0');
    wordFrequency1 = [];
    wordFrequency2 = [];
    wordFrequency3 = [];
    characters = [];
}

function ScrutinizeText(str) {
    //If the text input hasn't changed from the last time, return
    if(lastCount === count)
        return;
    lastCount = count;

    var densitySelection = GetDensitySelection();

    lastChar=''; currentChar=''; html1=''; html2='';html3='';html_c='';
    spaces=0; paragraphs=1; words=0;
    wordFrequency1 = [];wordFrequency2 = [];wordFrequency3 = [];characters = [];
    $('#space_c, #word_c').text('0');

    //If there are no characters in the text area return, else set the paragraph to 1
    if(str.length === 0)
    {
        DisplayEmptyDensity();
        $('#para_c').text('0');
        return;
    }
    else
        $('#para_c').text('1');

    for(var i = 0; i < str.length; i++)
    {
        lastChar = currentChar;
        currentChar = str.charAt(i);

        var charCode = currentChar.charCodeAt(0);
        var index = -1;

        if(densitySelection === 'char')
        {
            //if character is an alphabet
            if(charCode >=97 && charCode <= 122)
            {
                var wrd = currentChar.toLowerCase();
                for(var k=0; k<characters.length; k++)
                {
                    if(characters[k][1].toLowerCase() === wrd)
                    {
                        index = k;
                        break;
                    }
                }
                if(index !== -1)
                {
                    characters[index][0]++;
                }
                else
                {
                    if(wrd != '')
                        characters.push([1, wrd]);
                }
            }
        }

        if(currentChar === ' ')
        {
            spaces+=1;
            $('#space_c').text(CommarizeInteger(spaces.toString()));
        }
        else if(lastChar === '\n' && currentChar!== '\n')
        {//If the last character was newline and the current one isn't, then there is a paragraph
            paragraphs+=1;
            $('#para_c').text(CommarizeInteger(paragraphs.toString()));
        }
    }

    CountWords();

    if(densitySelection === 'word')
    {//If the density selection is keyword
        DisplayKeywordList();
    }
    else if(densitySelection === 'char')
    {
        FormList(characters);
        DisplayCharacterList();
    }
}

function StoreCharacters()
{
    var str = $('#text-input').val();
    for(var i = 0; i < str.length; i++)
    {
        lastChar = currentChar;
        currentChar = str.charAt(i);

        var charCode = currentChar.charCodeAt(0);
        var index = -1;

        //if character is an alphabet
        if(charCode >=97 && charCode <= 122)
        {
            var wrd = currentChar.toLowerCase();
            for(var k=0; k<characters.length; k++)
            {
                if(characters[k][1].toLowerCase() === wrd)
                {
                    index = k;
                    break;
                }
            }
            if(index !== -1)
            {
                characters[index][0]++;
            }
            else
            {
                if(wrd != '')
                    characters.push([1, wrd]);
            }
        }
    }
    characters.sort(sortFunction);
    characters.reverse();
    html_c=FormList(characters, true);
}

function CountWords()
{
    var str = $('#text-input').val();
    //Split words using whitespace characters
    var str_split = str.split(/[\s]+/);
    //hypen, comma and a full stop are not regarded as words
    var pattern = /^[&|,]$/g;
    var word_pattern = /[a-zA-Z0-9&]/;

    for(var i = 0; i<str_split.length; i++)
    {
        //Count as a word
        if(str_split[i] !== '' && word_pattern.test(str_split[i]) === true)
        {
            //Check for scenerios like aa! or a,a,a,a,a etc.
            if(str_split[i].length >= 3)
            {
                //in!the! has 2 words not one
                var splitWords = str_split[i].split(/[!|,|:|/]/);
                var len = splitWords.length;
                var counter = -1;//-1 because I am subtracting the words increment that occurs automatically after the for loop

                for(var j = 0; j < len; j++)
                {
                    if(word_pattern.test(splitWords[j]) === true)
                    {
                        counter++;
                    }
                }
                if(counter > 0)
                    words+=counter;
            }

            words += 1;
            $('#word_c').text(CommarizeInteger(words.toString()));
        }

    }
}

function FilterOutCommonWords (str)
{
    if(common_words.indexOf(str) !== -1)
        return true;
    else
        return false;
}

function GetFilterSelection ()
{
    return $("input[name='filter']:checked").val();
}

function GetDensitySelection ()
{
    return $("input[name='density']:checked").val();
}

function SkipWord(str)
{
	//If filtering out of common words is turned on and the word is common
	if(GetFilterSelection() === 'common' && FilterOutCommonWords(str) === true)
		return true;
	//If the word is a number of the length of the word is 1
	if(isNaN(str) === false || str.length === 1)
		return true;
	//If the string has an apostrophe and it's not a proper word
	if(apostrophe_pattern.test(str) === true && word_with_apostrophe.test(str) === false)
		return true;

	//Else return false
	return false;
}

function One(str)
{
    wordFrequency1 = [];
    var result = word_pattern2.exec(str);
    while(result)
    {
        var wrd = result.toString().toLowerCase();
		if(SkipWord(wrd) === true)
		{
			result = word_pattern2.exec(str);
			continue;
		}

        var index = -1;
        for(var k=0; k<wordFrequency1.length; k++)
        {
            if(wordFrequency1[k][1] === wrd)
            {
                index = k;
                break;
            }
        }
        if(index !== -1)
        {
            wordFrequency1[index][0]++;
        }
        else
        {
            wordFrequency1.push([1, wrd]);
        }
        result = word_pattern2.exec(str);
    }
    wordFrequency1.sort(sortFunction);
    wordFrequency1.reverse();

    html1 = FormList(wordFrequency1);
}

function Two(str)
{
    wordFrequency2 = [];
    var current='', previous='';
    var second = '';
    var result = word_pattern2.exec(str);
    while(result)
    {
        var wrd = result.toString().toLowerCase();
		if(SkipWord(wrd) === true)
		{
			result = word_pattern2.exec(str);
            continue;
		}
        if(previous !== '')
            second = previous+' '+current;
        var index = -1;
        previous = current;
        current = wrd;
        for(var k=0; k<wordFrequency2.length; k++)
        {
            if(wordFrequency2[k][1] === second)
            {
                index = k;
                break;
            }
        }
        if(index !== -1)
        {
            wordFrequency2[index][0]++;
        }
        else
        {
            if(second != '')
                wordFrequency2.push([1, second]);
        }
        result = word_pattern2.exec(str);
    }
    wordFrequency2.sort(sortFunction);
    wordFrequency2.reverse();

    html2 = FormList(wordFrequency2);
}

function Three(str)
{
    wordFrequency3 = [];
    var current='', previous1='', previous2='';
    var third = '';
    var result = word_pattern2.exec(str);
    while(result)
    {
        var wrd = result.toString().toLowerCase();
		if(SkipWord(wrd) === true)
		{
			result = word_pattern2.exec(str);
            continue;
		}
        if(previous1 !== '' && previous2 !== '')
            third = previous2+' '+previous1+' '+current;
        var index = -1;
        previous2 = previous1;
        previous1 = current;
        current = wrd;
        for(var k=0; k<wordFrequency3.length; k++)
        {
            if(wordFrequency3[k][1] === third)
            {
                index = k;
                break;
            }
        }
        if(index !== -1)
        {
            wordFrequency3[index][0]++;
        }
        else
        {
            if(third != '')
                wordFrequency3.push([1, third]);
        }
        result = word_pattern2.exec(str);
    }
    wordFrequency3.sort(sortFunction);
    wordFrequency3.reverse();

    html3 = FormList(wordFrequency3);
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function FormList(arr, all)
{
    var len = arr.length;
    //If the array is empty return an empty string
    if(len <= 0)
        return '';

    var showAll = (typeof all === 'undefined') ? false : all;
    var str = '';
    for(var m=0;m<len;m++)
    {
        str += OPEN;
        str += '<span>'+arr[m][1].toLowerCase()+'</span>';
        str += '<span class="badge">'+arr[m][0]+'</span>';
        str += CLOSE;
        if(m >= 9 && showAll === false)
            break;
    }
    return str;
}

function DisplayCharacterList ()
{
    if(html_c === '')
        StoreCharacters();
    if(html_c !== '')
        $('#density_ul').html(html_c);
    else
        DisplayEmptyDensity();
}

function DisplayKeywordList()
{
    var order = $('.active').attr('id');
    var display = '';
    if(order === 'one')
    {
        if(html1 === '')
            One($('#text-input').val());
        display = html1;
    }
    else if(order === 'two')
    {
        //Calculate the twos if it is empty, else just display it
        if(html2 === '')
            Two($('#text-input').val());
        display = html2;
    }
    else if(order === 'three')
    {
        //Calculate the threes if it is empty, else just display it
        if(html3 === '')
            Three($('#text-input').val());
        display = html3;
    }

    if(display !== '')
        $('#density_ul').html(display);
    else
        DisplayEmptyDensity();
}

function DisplayEmptyDensity ()
{
    var empty = '<li class="li">';
    empty += '<span class="italic empty">Start typing to get a list of keywords.</span>';
    empty +='</li>';
    $('#density_ul').html(empty);
}

function CommarizeInteger (num) {
    var digits = num.split("");
    var digitLength = digits.length;
    var total = num;
    if(digitLength > 3)
    {
        total = '';
        for(var i = digitLength-1, counter=1; i>=0; i--, counter++)
        {
            total = digits[i] + total;

            //Place comma after every 3 digits if there is still more digits left
            if((counter % 3 === 0) && (i !== 0))
                total = ',' + total;
        }
    }
    return total;
}

$('input[type=radio][name=filter]').on('change', function() {
    html1='';html2='';html3='';
    DisplayKeywordList();
});
$('input[type=radio][name=density]').on('change', function() {
    var densitySelection = GetDensitySelection();
    if(densitySelection === 'word')
    {//If the density selection is keyword
        DisplayKeywordList();
        $('#density').text('Keywords');
        $('#rdoFilterWrapper, #freq_container').removeAttr('style');
    }
    else if(densitySelection === 'char')
    {
        $('#density').text('Characters');
        $('#rdoFilterWrapper, #freq_container').css('display', 'none');
        StoreCharacters();
        FormList(characters);
        DisplayCharacterList();
    }
});


$(document).on('click', function(e){
    $el = ($(e.target));

    if($el.is('.stat-grp-lbl') || ($el.is('.stat-grp-icon')))
    {
        $icon = ($el.is('.stat-grp-lbl')) ? $el.next() : $el;
        if($el.is('#density')) {
            $icon = $el.parent().next();
        }
        $listContainer = $el.closest('.stat-grp-name').next('.stat-ul');
        if($listContainer.hasClass('close'))
        {
            $listContainer.slideDown('linear', function () {
                removeAttribute($listContainer, 'style');
                $listContainer.removeClass('close');
                classToggle($icon, 'glyphicon-menu-right', 'glyphicon-menu-down');
            });
        }
        else
        {
            $listContainer.slideUp('linear', function () {
                removeAttribute($listContainer, 'style');
                $listContainer.addClass('close');
                classToggle($icon, 'glyphicon-menu-down', 'glyphicon-menu-right');
            });
        }

    }
    else if($el.is('.freq-rate'))
    {
        $el = $(e.target);
        //Return if the current frequency rate is the active one
        if($el.hasClass('active'))
            return;

        //Remove active class from the currently active frequency rate
        document.getElementsByClassName('active')[0].classList.remove('active');

        //set the current rate to the active one
        $el.addClass('active');
        DisplayKeywordList();

    }
    else if($el.closest('#cls').length)
    {
        $('#text-input').val('');
        reset();
    }
    else if($el.closest('#undo').length)
    {
        execute('undo');
    }
    else if($el.closest('#redo').length)
    {
        execute('redo')
    }
});

function execute(command)
{
    document.execCommand(command, false, null);
    start();
}

$('.stat-grp-lbl, .stat-grp-icon').hover(function(e) {
    $el = ($(e.target).is('.stat-grp-lbl')) ? $(e.target) : $(e.target).prev();
    var isKeywords = false;
    if($el.closest('.stat-grp-name').is($('#grp-keywords')))
    {
        if($(e.target).is('.stat-grp-icon'))
            $el = $el.find('.stat-grp-lbl');
        isKeywords = true;
    }
    var color = (isKeywords) ? '#9b55b2' : '#0dc6a8';
    setColor($el, 'border-color', color);
}, function(e) {
    $el = ($(e.target).is('.stat-grp-lbl')) ? $(e.target) : $(e.target).prev();
    if($el.closest('.stat-grp-name').is($('#grp-keywords')))
    {
        if($(e.target).is('.stat-grp-icon'))
            $el = $el.find('.stat-grp-lbl');
    }
    removeAttribute($el, 'style');
});

function setColor ($el, rule, color)
{
    $el.css(rule, color);
    $el.css('color', '#720000');
}
function removeAttribute ($el, attr)
{
    $el.removeAttr(attr);
}
function classToggle ($el, remove, add)
{
    $el.removeClass(remove);
    $el.addClass(add);
}
