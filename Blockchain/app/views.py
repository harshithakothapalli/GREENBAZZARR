from django.shortcuts import render
from .models import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
from .logic import *

@api_view(['POST'])
def payment(request):
    id=request.data.get('id')
    totalPrice=request.data.get('totalPrice')
    paymentStatus=request.data.get('paymentStatus')
    createdAt=request.data.get('createdAt')
    status=request.data.get('status')

    user_data=addData({
        "type":"payment",
        "id":id,
        "totalPrice":totalPrice,
        "paymentStatus":paymentStatus,
        "createdAt":createdAt,
        "status":status,
    })
    print(user_data,'xfcrmjvgcghivgo')

    return Response({"Success":"add successfully",
        "id":id,
        "totalPrice":totalPrice,
        "paymentStatus":paymentStatus,
        "createdAt":createdAt,
        "status":status,     
    })

@api_view(['GET'])
def view_payment(request, user_id: str):
    try:
        data = retriveData()
        print("file_data", data)
        print("length of records in blockchain:", len(data))
        user_record = None
        for record in data:
            if record['id'] == user_id:
                user_record = record
                break
        if not user_record:
            return Response({"error": "User not found for the given user_id in blockchain"}, status=status.HTTP_404_NOT_FOUND)
        print(user_record, 'data')
        return Response({"data": user_record}, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response({"error": f"Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
