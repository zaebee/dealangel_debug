from django.shortcuts import render


def main_view(request):
    """docstring for main_view"""
    data = {
        'data': None,
    }
    return render(request, 'dealangel_debug/main_view.html', data)
