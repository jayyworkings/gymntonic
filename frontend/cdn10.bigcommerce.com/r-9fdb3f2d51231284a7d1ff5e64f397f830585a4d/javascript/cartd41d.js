var Cart = {
	ToggleShippingEstimation: function()
	{
		$('.EstimatedShippingMethods').hide();
		$('.EstimateShipping').toggle();
		$('.EstimateShippingLink').toggle();
		$('.EstimateShipping select:eq(0)').focus();
	},

	EstimateShipping: function()
	{
		if ($('#shippingZoneCountry').val() == 0) {
			alert(lang.SelectCountry);
			$('#shippingZoneCountry').focus();
			return;
		}

		if ($('#shippingZoneState').is(':visible') && $('#shippingZoneState').val() == 0) {
			alert(lang.SelectState);
			$('#shippingZoneState').focus();
			return;
		}

		if ($.trim($('#shippingZoneZip').val()) == '') {
			alert(lang.EnterZip);
			$('#shippingZoneZip').focus();
			return;
		}

		$('.EstimatedShippingMethods').hide();
		$('.EstimateShipping .EstimateShippingButtons span').hide();
		$('.EstimateShipping .EstimateShippingButtons input')
			.data('oldVal', $('.EstimateShipping .EstimateShippingButtons input').val())
			.val(lang.Calculating)
			.attr('disabled', true)
		;
		$.ajax({
			url: 'remote.php',
			type: 'post',
			data: {
				w: 'getShippingQuotes',
				city: $('#shippingZoneCity').val(),
				countryId: $('#shippingZoneCountry').val(),
				stateId: $('#shippingZoneState').val(),
				stateName: escape($('#shippingZoneStateName').val()),
				zipCode: $('#shippingZoneZip').val()
			},
			success: function(data)
			{
				$('.EstimatedShippingMethods .ShippingMethodList').html(data);
				$('.EstimatedShippingMethods').show();
				$('.EstimateShipping .EstimateShippingButtons span').show();
				$('.EstimateShipping .EstimateShippingButtons input')
					.val($('.EstimateShipping .EstimateShippingButtons input').data('oldVal'))
					.attr('disabled', false)
				;
			}
		});
	},

	ToggleShippingEstimateCountry: function()
	{
		var countryId = $('#shippingZoneCountry').val();
		$.ajax({
			url: 'remote.php',
			type: 'post',
			data: 'w=countryStates&c='+countryId,
			success: function(data)
			{
				$('#shippingZoneState option:gt(0)').remove();
				var states = data.split('~');
				var numStates = 0;
				for(var i =0; i < states.length; ++i) {
					vals = states[i].split('|');
					if(!vals[0]) {
						continue;
					}
					$('#shippingZoneState').append('<option value="'+vals[1]+'">'+vals[0]+'</option>');
					++numStates;
				}

				if(numStates == 0) {
					$('#shippingZoneState').hide();
					$('#shippingZoneStateName').show();
					$('#shippingZoneStateRequired').hide();
				}
				else {
					$('#shippingZoneState').show();
					$('#shippingZoneStateName').hide();
					$('#shippingZoneStateRequired').show();
				}
				$('#shippingZoneState').val('0');
			}
		});
	},

	UpdateShippingCost: function()
	{
		var returnVal = true;

		var method = $('.EstimatedShippingMethods input[type=radio]:checked').val();

		if(typeof(method) == 'undefined' || method == '') {
			alert(lang.ChooseShippingMethod);
			$('.EstimatedShippingMethods input[type=radio]:eq(0)').focus();
			returnVal = false;
			return returnVal;
		}

		if(returnVal == false) {
			return returnVal;
		}

		$('#cartForm').submit();
	},

	RemoveItem: function(itemId)
	{
		if(confirm(lang.CartRemoveConfirm)) {
			document.location.href = "cart.php?action=remove&item="+itemId;
		}
	},

	UpdateQuantity: function()
	{
		$('#cartForm').submit();
	},

	ValidateQuantityForm: function(form)
	{
		var valid = true;
		var qtyInputs = $(form).find('input.qtyInput');
		qtyInputs.each(function() {
			if(isNaN($(this).val()) || $(this).val() < 0) {
				alert(lang.InvalidQuantity);
				this.focus();
				this.select();
				valid = false;
				return false;
			}
		});
		if(valid == false) {
			return false;
		}

		return true;
	},

	CheckCouponCode: function()
	{
		if($('#couponcode').val() == '') {
			alert(lang.EnterCouponCode);
			$('#couponcode').focus();
			return false;
		}
		else {
			using_coupon = true;
		}
	},

	CheckGiftCertificateCode: function()
	{
		if($('#giftcertificatecode').val() == '') {
			alert(lang.EnterGiftCertificateCode);
			$('#giftcertificatecode').focus();
			return false;
		}
	},

	ManageGiftWrapping: function(itemId)
	{
		$.iModal({
			type: 'ajax',
			url: 'remote.php?w=selectGiftWrapping&itemId='+itemId
		});
	},

	ToggleGiftWrappingType: function(option)
	{
		if($(option).hasClass('HasPreview')) {
			$('.GiftWrappingPreviewLinks').hide();
			$('#GiftWrappingPreviewLink'+$(option).val()).show();
		}
		else {
			$('.GiftWrappingPreviewLinks').hide();
		}

		if($(option).hasClass('AllowComments')) {
			$(option).parents('.WrappingOption').find('.WrapComments').show();
		}
		else {
			$(option).parents('.WrappingOption').find('.WrapComments').hide();
		}
	},

	ToggleMultiWrapping: function(value)
	{
		if(value == 'same') {
			$('.WrappingOptionsSingle').show();
			$('.WrappingOptionsMultiple').hide();
		}
		else {
			$('.WrappingOptionsSingle').hide();
			$('.WrappingOptionsMultiple').show();
		}
	},

	RemoveGiftWrapping: function(itemId)
	{
		if(confirm(lang.ConfirmRemoveGiftWrapping)) {
			return true;
		}
		else {
			return false;
		}
	},

	ShowEditOptionsInCartForm: function(itemId)
	{
        var endpoint = config.ShopPath + '/remote.php?w=editconfigurablefieldsincart&itemid='+itemId;
        $.get(endpoint, function(contentData) {
            if(contentData) {
                // The data returned from ajax is html mixed with inline javascript,
                // which are executed and them stripped from DOM after they are inserted.
                // However, some of those javascript may be wrapped and needs to be executed
                // after domReady, but due to the nature of QuickView ajax call, they will
                // executed straightaway before the html is appneded to DOM and available
                // for normal jQuery operation.
                //
                // Therefore we need to
                // 1. remove those inline scripts from the response data before inserting into modal
                // 2. insert all html fragement to the DOM
                // 3. execute those inline scripts afterward
                var plainHtml = '';

                // download additional js libs
                $(contentData).filter('script[src]').each(function() {
                    plainHtml += $('<div></div>').append(this).html();
                });

                // insert html content
                $(contentData).not('script').each(function() {
                    plainHtml += $('<div></div>').append(this).html();
                });

                var options = {data: plainHtml};
                if (typeof config == 'object' && config.isMobile) {
                    options.width = 300;
                }

                $.iModal.close();
                $.iModal(options);

                $(contentData).filter('script:not([src])').each(function() {
                    $.globalEval(this.text || this.textContent || this.innerHTML || '');
                });
            }
        });
	},

	saveItemCustomizations: function()
	{
		if (!CheckProductConfigurableFields($('#CartEditProductFieldsForm'))) {
			return false;
		}

		// validate the attributes
		var attributesValidated = $('#CartEditProductFieldsForm')
			.validate()
			.form();

		if (!attributesValidated) {
			return false;
		}

		return true;
	},

	DeleteUploadedFile: function(fieldid, itemid)
	{
		if(confirm(lang.DeleteProductFieldFileConfirmation)) {
			$.ajax({
				url: 'remote.php',
				type: 'post',
				data: 'w=deleteuploadedfileincart&field='+fieldid+'&item='+itemid,
				success: function(data) {
					document.getElementById('CurrentProductFile_'+fieldid).value = '';
					$('#CartFileName_'+fieldid).hide();
				}
			});
		}
		return;
	},

	ReloadCart: function()
	{
		window.location = "cart.php";
	}

};
