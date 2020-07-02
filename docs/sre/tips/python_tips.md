pip install ipython

print ('*'.join(['2','8','4','5']))

a = "This sentence will be split to word list."
print(a.split())
此外需要注意的是split()和split(" ")是有区别的，后者在遇到连续多个空格的时候会分割出多个空字符串。

filename = 'image00015'
print(filename.startswith('image'))

index = '15'
filename = 'image' + index.zfill(7)
print(filename)
zfill(width)指定一个宽度，如果数字的长度大于宽度则什么也不做，但是如果小于宽度剩下的位会用0补齐。