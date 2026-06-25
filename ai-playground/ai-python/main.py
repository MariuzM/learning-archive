from transformers import pipeline


pipe = pipeline("sentiment-analysis")

out = pipe("I love transformers!")
print(out)
