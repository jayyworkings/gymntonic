<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xml:lang="en" lang="en" xmlns="http://www.w3.org/1999/xhtml">
	

<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<head>
		<link href="../cdn9.bigcommerce.com/r-ed4df9f0c7d32e85e8725e648dac0f8faffad0ff/themes/CosmeticStuff/Styles/popup.css" type="text/css" rel="stylesheet" />
		<script type="text/javascript" src="../cdn9.bigcommerce.com/r-9fdb3f2d51231284a7d1ff5e64f397f830585a4d/javascript/jquery/1.7.2/jquery.min.js"></script>
		<title>VIGOR BLUE - Sexual Enhancer and Performance Enhance Intensifier</title>
		<script type="text/javascript" src="../cdn10.bigcommerce.com/r-9fdb3f2d51231284a7d1ff5e64f397f830585a4d/javascript/jquery/plugins/jCarousel/jCarouseld41d.js?"></script>

		<script type="text/javascript">//<![CDATA[
			var ThumbURLs = new Array();
			var ImageDescriptions = new Array();
			var currentImageIndex = '0';
			//if the image index is not variation then it should be a number
			if(currentImageIndex != 'variation' && currentImageIndex != 'rule') {
				currentImageIndex = parseInt(currentImageIndex);
			}
			var ProductMaxImageHeight = 1280;
			var ProductMaxImageWidth = 1280;
			var currentCarouselStart = 0;
			var VariationImage = '';
			var RuleImage = '';
			var imagePreloader = new Image;
			ThumbURLs[0] = "productimage59dc.php\/\/cdn1.bigcommerce.com\/n-yp39j5\/2h44pn\/products\/1185\/images\/2326\/VIGOR_BLUE_Bottle_Mockup_Front_01__65058__59612.1738360166.1280.1280.jpg?c=2";ImageDescriptions[0]="\n\nUnlock the Power of VIGOR BLUE’s 100% Pure Propionil L Carnitine\nOur supplement offers one pure and potent ingredient: Propionil L Carnitine. Known for its ability to enhance circulation and boost energy production, it helps\nyou unlock peak male performance by naturally supporting the action of PDE5 inhibitors*. No additives. No fillers. Just pure results.\n\n \n\nKEY BENEFITS\n \n\n• Boosts male energy and endurance with 100% Propionil L Carnitine\n\n\n• Naturally enhances the effect of PDE5 inhibitors\n\n\n•  Works synergistically with your PDE5 inhibitor to boost blood flow for\nbetter cardiovascular and erectile power\n\n\n• Supports male stamina and vitality\n\n\n• Free from synthetic ingredients and fillers\n\n \n\n\n\n\n \n \nHOW VIGOR BLUE™ WORKS TO ENHANCE YOUR BODY’S NATURAL PROCESSES\nIn a double-blind, fixed-dose study conducted by researchers of the University of La Sapienza (Italy) in 2004, 40 patients with medically documented ED and\ndiabetes (type I &amp;amp; II) were randomized to receive oral Propionil L Carnitine (2 g\/day) plus sildenafil (50 mg twice weekly) (20 patients, Group 1) or sildenafil\nalone (20 patients, Group 2), in a double-blind, fixed-dose study. All patients had been previously treated unsuccessfully with a minimum of eight administrations\nof sildenafil. Efficacy was evaluated using the International Index of Erectile Function (IIEF) questionnaire.\n\n\nAfter 24 weeks of treatment, mean scores for IIEF had improved significantly in patients of Group 1 (4.25 ± 0.63 and 3.95 ± 1.0) compared with Group 2 (2.9 ±\n0.71 and 2.7 ± 0.96) ( p &amp;lt; 0.01). Moreover, the percentage of patients with improved erections (GEQ 68% vs. 23%) and successful intercourse attempts\n(76% vs. 34%) was significantly increased in Group 1 compared with Group 2 ( p &amp;lt; 0.01). Fourteen (70%) patients in Group 1 and four (20%) in Group 2\nreported an increase in mean IIEF EF domain score of ≥ 4 ( p &amp;lt; 0.01). Treatments were well tolerated and no patient discontinued study medication.\n ";

			function CloseImagePopup() {
				if(parent.top.$('#fancy_close').attr('id')) {
					parent.top.$('#fancy_close').trigger('click');
				} else {
					window.parent.focus();
					window.close();
				}
			}

			function showProductZoomImage(ImageIndex) {
				if(ImageIndex=='variation' || ImageIndex == 'rule' || ThumbURLs[ImageIndex]) {

					if(ImageDescriptions[ImageIndex]) {
						$('.ProductImageDescription').html(ImageDescriptions[ImageIndex]);
					}


					$('.ProductImageDescription').html(ImageDescriptions[ImageIndex]);

					imagePreloader = new Image;
					if (ImageIndex == 'variation') {
						imagePreloader.src = VariationImage;
					} else if (ImageIndex == 'rule') {
						imagePreloader.src = RuleImage;
					} else {
						imagePreloader.src = ThumbURLs[ImageIndex];
					}
					$(".ProductZoomImage").html('');

					if (imagePreloader.complete) {
						loadImageToContainer();
					} else {
						$(imagePreloader).unbind().bind('load', function() {
							loadImageToContainer();
						});
					}

					if(ImageIndex=='variation' || ImageIndex == 'rule') {
						$('.Nav').hide();
						$('.ImageCount').hide();
						return;
					}
					$('.Nav').show();
					$('.ImageCount').show();

					//image on the left of the visible carousel list
					if (ImageIndex < currentCarouselStart) {
						$('#ImageScrollPrev').trigger('click');
					}

					//image on the right of the visible carousel list
					if (ImageIndex > currentCarouselStart+9) {
						$('#ImageScrollNext').trigger('click');
					}

					highlightProductTinyImage(ImageIndex);
					if(ImageIndex >= ThumbURLs.length-1) {
						$('.NextLink').addClass('disabled');
					} else {
						$('.NextLink').removeClass('disabled');
					}

					if(ImageIndex == 0) {
						$('.PrevLink').addClass('disabled');
					} else {
						$('.PrevLink').removeClass('disabled');
					}


					$('.CurrentImageIndex').html(ImageIndex+1);
					currentImageIndex = ImageIndex;
				}
				return false;
			}


			function loadImageToContainer() {
				var w = $(window).width();
				//less body margin 20
				var h = $(window).height()-20;


				//resize the image container if the window size is changed
				var ImageBoxSize = getImageContainerSize();

				if($(".ProductZoomImageBox").width() != ImageBoxSize[0] || $(".ProductZoomImageBox").height() != ImageBoxSize[1]) {
					$(".ProductZoomImageBox").width(ImageBoxSize[0]);
					$(".ProductZoomImageBox").height(ImageBoxSize[1]);

				//	$(".ProductZoomImageBox").css('line-height', ImageBoxSize[1]+'px');
				//	alert(ImageBoxSize[1]);
				}

				var wr = Math.min(ImageBoxSize[0], imagePreloader.width) / imagePreloader.width;
				var hr = Math.min(ImageBoxSize[1], imagePreloader.height) / imagePreloader.height;

				//resize the image
				var r = Math.min(wr, hr);



				var width = Math.round(r * imagePreloader.width);
				var height = Math.round(r * imagePreloader.height);


				$(".ProductZoomImage").width(width);
				$(".ProductZoomImage").height(height);

				$(".ProductZoomImage").html('<img src="'+imagePreloader.src+'"  width="'+width+'" height="'+height+'" alt="'+ImageDescriptions[currentImageIndex]+'" />');

			}

			function initiateImageCarousel()
			{

				var circular = true;
				var visible = 10;
				var buttonWidth = 0;
				if(ThumbURLs.length <= 10) {
					visible = ThumbURLs.length;
				} else {
					$("#ImageScrollPrev").show();
					$("#ImageScrollNext").show();
					buttonWidth = $("#ImageScrollPrev").width()*2;
				}
				var scroll = Math.round(visible);
				$(".ProductTinyImageList").jCarouselLite({
					btnNext: ".next",
					btnPrev: ".prev",
					visible: visible,
					scroll: scroll,
					circular: false,
					speed: 200,
					afterEnd: function(a) {
						currentCarouselStart=parseInt($(a).find('img').attr('id').replace('TinyImage_', ''));
					}
				});

				// IE 6 doesn't render the carousel properly, the following code is the fix for IE6
				if($.browser.msie && $.browser.version.substr(0,1) == 6) {
					$(".ProductTinyImageList").width($(".ProductTinyImageList").width()+4);
					var liHeight = $(".ProductTinyImageList li").height();
					$(".ProductTinyImageList").height(liHeight+2);
				}

				var TinyListWidth = $(".ProductTinyImageList").width();
				$(".ImageCarousel").width(TinyListWidth+buttonWidth+20);
				highlightProductTinyImage(currentImageIndex);
			}


			function getImageContainerSize()
			{
				var w = $(window).width();
				var h = $(window).height() - 30;

				var carouselH = $('.ProductTinyImageList').height()+30;
				var titleH = $('.Title').height() +10;
				var imageCountH = $('.ImageCount').height();
				var navH = $('.Nav').height();

				var width = w-20;
				var height = h - carouselH - titleH - imageCountH - navH;

				var size = new Array(width, height);
				return size;
			}



			function highlightProductTinyImage(ThumbIndex) {
				$('.ProductTinyImageList li').css('border', '1px solid gray');
				$('.ProductTinyImageList .TinyOuterDiv').css('border', '2px solid white');

				$('#TinyImageBox_'+ThumbIndex).css('border', '1px solid #075899');
				$('#TinyImageBox_'+ThumbIndex+' .TinyOuterDiv').css('border', '2px solid #075899');
			}

			var loop=1;
			function initiateImageGallery() {

				var containerSize = getImageContainerSize();
				if(loop <= 5 && (containerSize[0] <= 0 || containerSize[1] <= 0)){
					setTimeout(initiateImageGallery, 500);
					return false;
				}

				$('.ImageCarousel').fadeIn('normal');
				$('.ProductZoomImageBox').fadeIn('normal');
				$(".ProductZoomImageBox").width(containerSize[0]);
				$(".ProductZoomImageBox").height(containerSize[1]);

				showProductZoomImage(currentImageIndex);
				if(ThumbURLs.length <= 0) {
					$(".Nav").hide();
				} else {
					initiateImageCarousel();
				}
			}

			$(document).ready(function() {
				initiateImageGallery();
			});
		//]]></script>
	</head>
	<body>
		<div class="Title">
	<h1><div class="ProductImageName" style="position:relative;">VIGOR BLUE - Sexual Enhancer and Performance Enhance Intensifier</div></h1>
	<h2><div class="ProductImageDescription" style="position:relative;"></div></h2>
</div>
<div class="ProductZoomImageBox" style="display:none;">
	<div class="ProductZoomImage">
	</div>
</div>


<div class="ImageCarousel" style="display:none;margin:0 auto;">
	<button id="ImageScrollPrev" class="prev">
		<img width="20" src="../cdn10.bigcommerce.com/r-ed4df9f0c7d32e85e8725e648dac0f8faffad0ff/themes/CosmeticStuff/images/LeftArrow.png" alt="" />
	</button>

	<div class="ProductTinyImageList">
		<ul>
			<li style = "height:34px; width:34px;"  onmouseover="" onclick="showProductZoomImage(0); return false;" id="TinyImageBox_0">
	<div class="TinyOuterDiv" style = "height:30px; width:30px;">
		<div style = "height:30px; width:30px;">
			<a href="javascript:void(0);" rel='{"gallery": "prodImage", "smallimage": "", "largeimage": ""}'><img id="TinyImage_0" style="padding-top:0px;" width="30" height="30" src="../cdn1.bigcommerce.com/n-yp39j5/2h44pn/products/1185/images/2326/VIGOR_BLUE_Bottle_Mockup_Front_01__65058__59612.1738360166.30.304847.jpg?c=2" alt="

Unlock the Power of VIGOR BLUE’s 100% Pure Propionil L Carnitine
Our supplement offers one pure and potent ingredient: Propionil L Carnitine. Known for its ability to enhance circulation and boost energy production, it helps
you unlock peak male performance by naturally supporting the action of PDE5 inhibitors*. No additives. No fillers. Just pure results.

 

KEY BENEFITS
 

• Boosts male energy and endurance with 100% Propionil L Carnitine


• Naturally enhances the effect of PDE5 inhibitors


•  Works synergistically with your PDE5 inhibitor to boost blood flow for
better cardiovascular and erectile power


• Supports male stamina and vitality


• Free from synthetic ingredients and fillers

 




 
 
HOW VIGOR BLUE™ WORKS TO ENHANCE YOUR BODY’S NATURAL PROCESSES
In a double-blind, fixed-dose study conducted by researchers of the University of La Sapienza (Italy) in 2004, 40 patients with medically documented ED and
diabetes (type I &amp;amp; II) were randomized to receive oral Propionil L Carnitine (2 g/day) plus sildenafil (50 mg twice weekly) (20 patients, Group 1) or sildenafil
alone (20 patients, Group 2), in a double-blind, fixed-dose study. All patients had been previously treated unsuccessfully with a minimum of eight administrations
of sildenafil. Efficacy was evaluated using the International Index of Erectile Function (IIEF) questionnaire.


After 24 weeks of treatment, mean scores for IIEF had improved significantly in patients of Group 1 (4.25 ± 0.63 and 3.95 ± 1.0) compared with Group 2 (2.9 ±
0.71 and 2.7 ± 0.96) ( p &amp;lt; 0.01). Moreover, the percentage of patients with improved erections (GEQ 68% vs. 23%) and successful intercourse attempts
(76% vs. 34%) was significantly increased in Group 1 compared with Group 2 ( p &amp;lt; 0.01). Fourteen (70%) patients in Group 1 and four (20%) in Group 2
reported an increase in mean IIEF EF domain score of ≥ 4 ( p &amp;lt; 0.01). Treatments were well tolerated and no patient discontinued study medication.
 " title="

Unlock the Power of VIGOR BLUE’s 100% Pure Propionil L Carnitine
Our supplement offers one pure and potent ingredient: Propionil L Carnitine. Known for its ability to enhance circulation and boost energy production, it helps
you unlock peak male performance by naturally supporting the action of PDE5 inhibitors*. No additives. No fillers. Just pure results.

 

KEY BENEFITS
 

• Boosts male energy and endurance with 100% Propionil L Carnitine


• Naturally enhances the effect of PDE5 inhibitors


•  Works synergistically with your PDE5 inhibitor to boost blood flow for
better cardiovascular and erectile power


• Supports male stamina and vitality


• Free from synthetic ingredients and fillers

 




 
 
HOW VIGOR BLUE™ WORKS TO ENHANCE YOUR BODY’S NATURAL PROCESSES
In a double-blind, fixed-dose study conducted by researchers of the University of La Sapienza (Italy) in 2004, 40 patients with medically documented ED and
diabetes (type I &amp;amp; II) were randomized to receive oral Propionil L Carnitine (2 g/day) plus sildenafil (50 mg twice weekly) (20 patients, Group 1) or sildenafil
alone (20 patients, Group 2), in a double-blind, fixed-dose study. All patients had been previously treated unsuccessfully with a minimum of eight administrations
of sildenafil. Efficacy was evaluated using the International Index of Erectile Function (IIEF) questionnaire.


After 24 weeks of treatment, mean scores for IIEF had improved significantly in patients of Group 1 (4.25 ± 0.63 and 3.95 ± 1.0) compared with Group 2 (2.9 ±
0.71 and 2.7 ± 0.96) ( p &amp;lt; 0.01). Moreover, the percentage of patients with improved erections (GEQ 68% vs. 23%) and successful intercourse attempts
(76% vs. 34%) was significantly increased in Group 1 compared with Group 2 ( p &amp;lt; 0.01). Fourteen (70%) patients in Group 1 and four (20%) in Group 2
reported an increase in mean IIEF EF domain score of ≥ 4 ( p &amp;lt; 0.01). Treatments were well tolerated and no patient discontinued study medication.
 " /></a>
		</div>
	</div>
</li>

		</ul>
	</div>

	<button id="ImageScrollNext" class="next">
		<img width="20" src="../cdn10.bigcommerce.com/r-ed4df9f0c7d32e85e8725e648dac0f8faffad0ff/themes/CosmeticStuff/images/RightArrow.png" alt="" />
	</button>


</div>

<div class = 'Nav'>
	<div style="display:none;">
	<a class="PrevLink disabled" href="#" onclick="showProductZoomImage(parseInt(currentImageIndex)-1); return false">&laquo; Previous</a>
	|
	<a class="NextLink disabled" href="#" onclick="showProductZoomImage(parseInt(currentImageIndex)+1); return false">Next &raquo;</a>
	</div>
</div>
<div class="ImageCount">
	(Image&nbsp;<span class="CurrentImageIndex"></span>&nbsp;of 1)
</div>

	<script type="text/javascript" src="../cdn9.bigcommerce.com/shared/js/csrf-protection-header-5eeddd5de78d98d146ef4fd71b2aedce4161903e.js"></script></body>


</html>